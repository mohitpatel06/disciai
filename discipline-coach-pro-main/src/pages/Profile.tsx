// Profile.tsx - User profile and settings page
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Profile = () => {
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update logic
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings</p>
        </div>

        {/* Avatar & Name */}
        <Card className="shadow-[var(--shadow-soft)]">
          <CardContent className="flex items-center gap-5 p-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-accent/10 text-accent font-display text-xl">
                U
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display font-semibold text-lg">User</p>
              <p className="text-sm text-muted-foreground">user@example.com</p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="font-display">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
