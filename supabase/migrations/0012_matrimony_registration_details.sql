-- ============================================================================
-- 0012_matrimony_registration_details.sql
-- mat_get_profile now also returns the member's REGISTRATION details
-- (community, education, vision, family, contact, registration date), and falls
-- back to registration data when a matrimony field is empty.
--
-- Same consent rules as 0011:
--   public to approved members : registration date, clan/sub-clan, title,
--                                kula/kaval deivam, education, qualifications,
--                                profession category, vision, province/country
--   after the owner ACCEPTS    : name, family_id, parents/grandparents names,
--                                family members + family tree, workplace, address, city,
--                                e-mail, WhatsApp, Facebook, blood group, DOB
-- Registration columns are read with to_jsonb(), so a column that does not
-- exist in the live database simply returns null instead of failing.
-- Idempotent: safe to re-run.  Return type unchanged (jsonb).
-- ============================================================================
create or replace function public.mat_get_profile(p_profile_id uuid)
returns jsonb
language plpgsql stable security definer
set search_path = public, pg_temp
as $$
declare
  m          public.matrimony_profiles;
  p          public.profiles;
  pj         jsonb;
  v_full     boolean;
  v_self     boolean := (p_profile_id = auth.uid());
  v_admin    boolean := coalesce(public.is_admin(), false);
  v_conn     boolean;
  v_status   text;
  v_quals    text;
  v_family   jsonb;
  v_tree     jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if not (v_self or v_admin or public.mat_is_approved_caller()) then
    raise exception 'Only approved members can use Matrimony' using errcode = '42501';
  end if;

  select * into m from public.matrimony_profiles where profile_id = p_profile_id;
  if not found then return null; end if;
  select * into p from public.profiles where id = p_profile_id;
  pj := to_jsonb(p);

  if not (v_self or v_admin) and (m.status <> 'published' or p.registration_status <> 'approved') then
    return null;
  end if;

  v_conn := public.mat_connected_with(p_profile_id);
  v_full := v_self or v_admin or v_conn;
  select i.status into v_status from public.matrimony_interests i
   where (i.from_profile = auth.uid() and i.to_profile = p_profile_id)
      or (i.to_profile = auth.uid() and i.from_profile = p_profile_id)
   order by i.created_at desc limit 1;

  if jsonb_typeof(pj->'qualifications') = 'array' and jsonb_array_length(pj->'qualifications') > 0 then
    select string_agg(x, ', ') into v_quals from jsonb_array_elements_text(pj->'qualifications') x;
  end if;

  if v_full then
    select coalesce(jsonb_agg(jsonb_build_object(
             'relation_type', f.relation_type::text, 'full_name', f.full_name,
             'is_living', f.is_living, 'occupation', f.occupation) order by f.created_at), '[]'::jsonb)
      into v_family
      from public.family_members f where f.profile_id = p_profile_id;

    select coalesce(jsonb_agg(jsonb_build_object(
             'member_id', t.member_id, 'parent_member_id', t.parent_member_id,
             'generation_level', t.generation_level, 'position_order', t.position_order,
             'relation_type', fm.relation_type::text, 'full_name', fm.full_name,
             'is_living', fm.is_living) order by t.generation_level, t.position_order), '[]'::jsonb)
      into v_tree
      from public.family_tree t
      join public.family_members fm on fm.id = t.member_id
     where t.profile_id = p_profile_id;
  end if;

  return jsonb_build_object(
    'profile_id', m.profile_id,
    'member_code', m.member_code,
    'status', m.status,
    'age', date_part('year', age(p.dob))::int,
    'gender', p.gender::text,
    'branch', p.branch::text,
    'district', p.district,
    'height_cm', m.height_cm,
    'marital_status', coalesce(m.marital_status,
        case lower(coalesce(pj->>'marital_status', pj->>'marriage_status'))
          when 'single' then 'never_married' when 'divorced' then 'divorced' when 'widowed' then 'widowed' end),
    'diet', m.diet,
    'education_summary', coalesce(nullif(trim(m.education_summary), ''), nullif(pj->>'education', ''), v_quals),
    'occupation_title', coalesce(nullif(trim(m.occupation_title), ''), nullif(pj->>'occupation', '')),
    'employer', m.employer,
    'about', m.about,
    'veettu_peyar', m.veettu_peyar,
    'kootam', coalesce(nullif(trim(m.kootam), ''), nullif(pj->>'gothram', '')),
    'kula_deivam', coalesce(nullif(trim(m.kula_deivam), ''), nullif(pj->>'kula_deivam', '')),
    'native_place', coalesce(nullif(trim(m.native_place), ''), nullif(pj->>'native_place', '')),
    'jathakam_type', m.jathakam_type,
    'pref_age_min', m.pref_age_min,
    'pref_age_max', m.pref_age_max,
    'pref_branches', m.pref_branches,
    'pref_education', m.pref_education,
    'pref_location', m.pref_location,
    'pref_notes', m.pref_notes,
    'photo_path', case when m.photo_path is not null
                        and (v_self or v_admin or m.photo_visibility = 'members' or v_conn)
                       then m.photo_path end,
    'interest_status', v_status,
    'is_shortlisted', exists (select 1 from public.matrimony_shortlists s
                              where s.profile_id = auth.uid() and s.target_id = p_profile_id),
    'is_connected', v_conn,

    -- ---- registration details visible to approved members ----
    'member_since',  p.created_at,
    'approved_at',   p.approved_at,
    'sub_clan',      coalesce(nullif(pj->>'sub_clan', ''), nullif(pj->>'sub_group', '')),
    'title',         nullif(pj->>'title', ''),
    'kaval_deivam',  nullif(pj->>'kaval_deivam', ''),
    'province',      nullif(pj->>'province', ''),
    'country',       nullif(pj->>'country', ''),
    'qualifications', case when jsonb_typeof(pj->'qualifications') = 'array' then pj->'qualifications' end,
    'professional_category', nullif(pj->>'professional_category', ''),
    'vision_reasons', case when jsonb_typeof(pj->'vision_reasons') = 'array' then pj->'vision_reasons' end
  ) || jsonb_build_object(
    -- ---- released only to self / admin / accepted connection ----
    'full_name',      case when v_full then p.full_name end,
    'rasi',           case when v_full then m.rasi end,
    'nakshatram',     case when v_full then m.nakshatram end,
    'padam',          case when v_full then m.padam end,
    'dosham_note',    case when v_full then m.dosham_note end,
    'horoscope_path', case when v_full then m.horoscope_path end,
    'contact_phone',  case when v_full then coalesce(nullif(trim(m.contact_phone), ''), p.mobile) end,
    'family_id',      case when v_full then nullif(pj->>'family_id', '') end,
    'email',          case when v_full then p.email end,
    'whatsapp',       case when v_full then nullif(pj->>'whatsapp', '') end,
    'facebook_url',   case when v_full then nullif(pj->>'facebook_url', '') end,
    'address',        case when v_full then p.address end,
    'city',           case when v_full then nullif(pj->>'city', '') end,
    'dob',            case when v_full then p.dob end,
    'blood_group',    case when v_full then p.blood_group end,
    'birth_place',    case when v_full then nullif(pj->>'birth_place', '') end,
    'father_name',               case when v_full then nullif(pj->>'father_name', '') end,
    'father_birth_place',        case when v_full then nullif(pj->>'father_birth_place', '') end,
    'grandfather_name',          case when v_full then nullif(pj->>'grandfather_name', '') end,
    'grandfather_birth_place',   case when v_full then nullif(pj->>'grandfather_birth_place', '') end,
    'great_grandfather_name',    case when v_full then nullif(pj->>'great_grandfather_name', '') end,
    'great_grandfather_birth_place', case when v_full then nullif(pj->>'great_grandfather_birth_place', '') end,
    'workplace',      case when v_full then coalesce(nullif(pj->>'business_name', ''), nullif(pj->>'doctor_hospital', ''),
                                                    nullif(pj->>'bank_name', ''), nullif(pj->>'teacher_school', '')) end,
    'family_members', case when v_full then v_family end,
    'family_tree',    case when v_full then v_tree end
  ) || jsonb_build_object(
    -- self-only settings
    'photo_visibility', case when v_self or v_admin then m.photo_visibility end,
    'income_range',     case when v_self or v_admin then m.income_range end
  );
end;
$$;