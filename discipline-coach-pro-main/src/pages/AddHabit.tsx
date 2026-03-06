// AddHabit.tsx - Page for logging daily habits
import DashboardLayout from "@/components/DashboardLayout";
import HabitForm from "@/components/HabitForm";

const AddHabit = () => {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">Add Habit</h1>
          <p className="text-muted-foreground mt-1">Log your habits for today</p>
        </div>
        <HabitForm />
      </div>
    </DashboardLayout>
  );
};

export default AddHabit;
