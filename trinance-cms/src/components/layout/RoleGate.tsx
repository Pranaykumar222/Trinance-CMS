import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RoleGate({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { role } = useAuth();
  const navigate = useNavigate();

  if (!allow.includes(role)) {
    return (
      <div className="mx-auto max-w-lg py-16">
        <EmptyState
          icon={ShieldAlert}
          title="You don't have access to this area"
          description={`Your current role (${role}) can't view this module. Switch to a role with the right permissions using the account menu, top right.`}
          action={
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to dashboard
            </Button>
          }
        />
      </div>
    );
  }
  return <>{children}</>;
}
