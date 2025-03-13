import React, { useState } from "react";
import { Helmet } from "react-helmet";
import UserManagement from "@/components/users/UserManagement";
import UserForm from "@/components/users/UserForm";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface UserFormValues {
  name: string;
  email: string;
  role: string;
  sendInvite: boolean;
  status: string;
}

const UsersPage = () => {
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleCreateUser = (values: UserFormValues) => {
    console.log("Creating new user:", values);
    // In a real app, you would send this data to your backend API
    setShowUserForm(false);
  };

  const handleEditUser = (values: UserFormValues) => {
    console.log("Updating user:", editingUser?.id, values);
    // In a real app, you would send this data to your backend API
    setEditingUser(null);
  };

  return (
    <>
      <Helmet>
        <title>User Management - CMS Platform</title>
      </Helmet>
      <DashboardLayout>
        <UserManagement />

        {/* New User Form Dialog */}
        <UserForm
          open={showUserForm}
          onOpenChange={setShowUserForm}
          onSubmit={handleCreateUser}
          isEditing={false}
        />

        {/* Edit User Form Dialog */}
        {editingUser && (
          <UserForm
            open={!!editingUser}
            onOpenChange={() => setEditingUser(null)}
            onSubmit={handleEditUser}
            initialValues={editingUser}
            isEditing={true}
          />
        )}
      </DashboardLayout>
    </>
  );
};

export default UsersPage;
