import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { TrackManagement } from "@/components/admin/TrackManagement";
import { ApplicantsManagement } from "@/components/admin/ApplicantsManagement";
import { PostManagement } from "@/components/admin/PostManagement";
import { TrainerManagement } from "@/components/admin/TrainerManagement";
import { TrainerProfile } from "@/components/admin/TrainerProfile";
import { TraineesManagement } from "@/components/admin/TraineesManagement";
import { TrainingManagement } from "@/components/admin/TrainingManagement";
import { TrainingOverview } from "@/components/admin/TrainingOverview";
import { AdminLayout } from "@/components/dashboard/admin/AdminLayout";
import { adminNavigation } from "@/components/dashboard/admin/adminNavigation";
import { AdminAnalyticsSection } from "@/components/dashboard/admin/sections/AdminAnalyticsSection";
import { AdminOverviewSection } from "@/components/dashboard/admin/sections/AdminOverviewSection";

const validSections = new Set(adminNavigation.map((item) => item.key));

function getSectionFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const candidate = segments[2];
  if (!candidate || !validSections.has(candidate as (typeof adminNavigation)[number]["key"])) {
    return "overview";
  }
  return candidate;
}

export default function CompanyDashboard() {
  const location = useLocation();
  const [trainerProfileId, setTrainerProfileId] = useState<string | null>(null);

  const section = useMemo(() => getSectionFromPath(location.pathname), [location.pathname]);

  useEffect(() => {
    setTrainerProfileId(null);
  }, [section]);

  const sectionContent = useMemo(() => {
    switch (section) {
      case "overview":
        return <AdminOverviewSection />;
      case "tracks":
        return <TrackManagement />;
      case "trainings":
        return <TrainingManagement />;
      case "trainers":
        return trainerProfileId ? (
          <TrainerProfile trainerId={trainerProfileId} onBack={() => setTrainerProfileId(null)} />
        ) : (
          <TrainerManagement onViewTrainer={setTrainerProfileId} />
        );
      case "trainees":
        return <TraineesManagement />;
      case "posts":
        return <PostManagement />;
      case "applicants":
        return <ApplicantsManagement />;
      case "analytics":
        return (
          <div className="space-y-6">
            <AdminAnalyticsSection />
            <TrainingOverview />
          </div>
        );
      default:
        return <AdminOverviewSection />;
    }
  }, [section, trainerProfileId]);

  return <AdminLayout section={section}>{sectionContent}</AdminLayout>;
}
