-- Public-facing contact email (card, vCard, mailto) separate from auth login email.
-- profiles.email continues to mirror auth.users.email from the API for admin/legacy;
-- contact_email is user-editable for a professional address on their card.
alter table profiles add column if not exists contact_email text;

comment on column profiles.contact_email is
  'Optional email shown on the public profile, vCard, and digital card. Falls back to profiles.email when null.';

update profiles
set contact_email = email
where contact_email is null
  and email is not null;
