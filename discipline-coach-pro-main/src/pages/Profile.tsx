import { useState, useEffect } from "react";
import axios from "axios";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Profile = () => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://disciai-backend.onrender.com/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setName(res.data.name);
        setEmail(res.data.email);
      } catch (error) {
        console.log("Error fetching profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://disciai-backend.onrender.com/api/auth/profile",
        { name, email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Profile updated successfully");
    } catch (error) {
      console.log(error);
      alert("Update failed");
    }
  };

  const avatarLetter = name ? name.charAt(0).toUpperCase() : "U";

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">

        <div>
          <h1 className="text-3xl font-display font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings
          </p>
        </div>

        <Card>
          <CardContent className="flex items-center gap-5 p-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl font-bold bg-green-100 text-green-700">
                {avatarLetter}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">
                {loading ? "Loading..." : name || "User"}
              </p>
              <p className="text-sm text-muted-foreground">
                {loading ? "" : email || "user@example.com"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit">
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