
-- Add file_hash column to analysis_results
ALTER TABLE public.analysis_results ADD COLUMN file_hash TEXT;

-- Create index for fast hash lookups
CREATE INDEX idx_analysis_results_file_hash ON public.analysis_results (file_hash);

-- Create index for company+year lookups
CREATE INDEX idx_analysis_results_company_year ON public.analysis_results (lower(company_name), report_year);
