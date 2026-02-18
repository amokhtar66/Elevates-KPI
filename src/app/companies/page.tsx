import { getCompanies } from "@/actions/companies";
import { CompanyCard } from "@/components/companies/company-card";
import { CompanyFormDialog } from "@/components/companies/company-form-dialog";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Companies</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}

        <CompanyFormDialog
          trigger={
            <Button
              variant="outline"
              className="flex h-full min-h-[100px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
            >
              <Plus className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Add Company
              </span>
            </Button>
          }
        />
      </div>

      {companies.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <Building2 className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No companies yet</p>
            <p className="text-sm">
              Click &quot;Add Company&quot; to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
