-- Optional square logo for co-branded downloadable QR cards (separate from profile photo).
alter table profiles add column if not exists company_logo_url text;

comment on column profiles.company_logo_url is
  'Optional company/brand logo shown on the downloadable TapTag digital card PNG.';
