// AddHabit.tsx - Page for logging and editing habits
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import HabitForm from "@/components/HabitForm";

const AddHabit = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">
            {isEditMode ? "Edit Habit" : "Add Habit"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode
              ? "Update your habit configuration and targets"
              : "Log your habits for today"}
          </p>
        </div>
        <HabitForm editId={editId || undefined} />
      </div>
    </DashboardLayout>
  );
};

export default AddHabit;
