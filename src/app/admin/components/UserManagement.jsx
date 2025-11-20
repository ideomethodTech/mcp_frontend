// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Trash2, Loader2 } from "lucide-react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import {
//   useListJoinRequests,
//   useListOrgUsers,
//   useApproveJoinRequest,
//   useRejectJoinRequest,
//   useRemoveUserFromOrg,
//   useChangeUserRole,
// } from "@/lib/api/queries";
// import { toast } from "react-toastify";
// import { useQueryClient } from "@tanstack/react-query";
// import { format } from "date-fns";

// export default function UserManagement() {
//   const queryClient = useQueryClient();
  
//   // State for loading indicators
//   const [approvingId, setApprovingId] = useState(null);
//   const [rejectingId, setRejectingId] = useState(null);
//   const [removingId, setRemovingId] = useState(null);
//   const [changingRoleId, setChangingRoleId] = useState(null);

//   // API hooks
//   const { data: joinRequests, isLoading: isLoadingRequests } = useListJoinRequests();
// //   const { data: orgUsers, isLoading: isLoadingUsers } = useListOrgUsers();
// const user = JSON.parse(localStorage.getItem("user"));
// const orgId = user?.org_id || user?.organization_id;
// const { data: orgUsers, isLoading: isLoadingUsers } = useListOrgUsers(orgId);
//   const approveMutation = useApproveJoinRequest();
//   const rejectMutation = useRejectJoinRequest();
//   const removeMutation = useRemoveUserFromOrg();
//   const changeRoleMutation = useChangeUserRole();

//   console.log(joinRequests?.join_requests
// )
//   // Handlers
//   const handleApprove = async (userId) => {
//     setApprovingId(userId);
//     try {
//       await approveMutation.mutateAsync({ target_user_id: userId });
//       queryClient.invalidateQueries({ queryKey: ["joinRequests"] });
//       queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
//       toast.success("User approved successfully");
//     } catch (error) {
//       toast.error("Failed to approve user");
//       console.log(error);
//     } finally {
//       setApprovingId(null);
//     }
//   };

//   const handleReject = async (userId) => {
//     setRejectingId(userId);
//     try {
//       await rejectMutation.mutateAsync({ target_user_id: userId });
//       queryClient.invalidateQueries({ queryKey: ["joinRequests"] });
//       toast.success("User request rejected");
//     } catch (error) {
//       toast.error("Failed to reject user");
//     } finally {
//       setRejectingId(null);
//     }
//   };

//   const handleRemoveUser = async (userId) => {
//     if (!confirm("Are you sure you want to remove this user from the organization?")) return;
//     setRemovingId(userId);
//     try {
//       await removeMutation.mutateAsync(userId);
//       queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
//       toast.success("User removed successfully");
//     } catch (error) {
//       toast.error("Failed to remove user");
//     } finally {
//       setRemovingId(null);
//     }
//   };

//   const handleChangeRole = async (userId, newRole) => {
//     setChangingRoleId(userId);
//     try {
//       await changeRoleMutation.mutateAsync({ target_user_id: userId, role: newRole });
//       queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
//       toast.success("User role updated successfully");
//     } catch (error) {
//       toast.error("Failed to update user role");
//     } finally {
//       setChangingRoleId(null);
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>User Management</CardTitle>
//         <CardDescription>Manage join requests and organization users.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-6">
//           {/* Pending Requests Section */}
//           <div>
//             <h3 className="text-lg font-semibold mb-4">Pending Join Requests</h3>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Email</TableHead>
//                   <TableHead>Request Date</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {isLoadingRequests ? (
//                   <TableRow>
//                     <TableCell colSpan={4} className="text-center py-8">
//                       <Loader2 className="h-6 w-6 animate-spin mx-auto" />
//                     </TableCell>
//                   </TableRow>
//                 ) : joinRequests && joinRequests?.join_requests?.length > 0 ? (
//                   joinRequests?.join_requests?.map((request) => (
//                     <TableRow key={request.user_id}>
//                       <TableCell className="font-medium">{request.name}</TableCell>
//                       <TableCell>{request.email}</TableCell>
//                       <TableCell>
//                         {request.created_at ? format(new Date(request.created_at), "MMM dd, yyyy") : "N/A"}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end gap-2">
//                           <Button
//                             size="sm"
//                             onClick={() => handleApprove(request.user_id)}
//                             disabled={approvingId === request.user_id}
//                           >
//                             {approvingId === request.user_id ? (
//                               <Loader2 className="h-4 w-4 animate-spin" />
//                             ) : (
//                               "Approve"
//                             )}
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handleReject(request.user_id)}
//                             disabled={rejectingId === request.user_id}
//                           >
//                             {rejectingId === request.user_id ? (
//                               <Loader2 className="h-4 w-4 animate-spin" />
//                             ) : (
//                               "Reject"
//                             )}
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
//                       No pending requests
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>

//           {/* Current Users Section */}
//           <div>
//             <h3 className="text-lg font-semibold mb-4">Organization Users</h3>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Email</TableHead>
//                   <TableHead>Role</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {isLoadingUsers ? (
//                   <TableRow>
//                     <TableCell colSpan={4} className="text-center py-8">
//                       <Loader2 className="h-6 w-6 animate-spin mx-auto" />
//                     </TableCell>
//                   </TableRow>
//                 ) : orgUsers && orgUsers.length > 0 ? (
//                   orgUsers.map((user) => (
//                     <TableRow key={user.user_id}>
//                       <TableCell className="font-medium">{user.name}</TableCell>
//                       <TableCell>{user.email}</TableCell>
//                       <TableCell>
//                         <Select
//                           value={user.role || "user"}
//                           onValueChange={(newRole) => handleChangeRole(user.user_id, newRole)}
//                           disabled={changingRoleId === user.user_id}
//                         >
//                           <SelectTrigger className="w-28">
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="user">User</SelectItem>
//                             <SelectItem value="admin">Admin</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="text-muted-foreground hover:text-destructive"
//                           onClick={() => handleRemoveUser(user.user_id)}
//                           disabled={removingId === user.user_id}
//                         >
//                           {removingId === user.user_id ? (
//                             <Loader2 className="h-4 w-4 animate-spin" />
//                           ) : (
//                             <Trash2 className="h-4 w-4" />
//                           )}
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
//                       No users found
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useListJoinRequests,
  useListOrgUsers,
  useApproveJoinRequest,
  useRejectJoinRequest,
  useRemoveUserFromOrg,
  useChangeUserRole,
} from "@/lib/api/queries";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function UserManagement() {
  const queryClient = useQueryClient();
  
  // State for loading indicators
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [changingRoleId, setChangingRoleId] = useState(null);

  // Get user and orgId
  const user = JSON.parse(localStorage.getItem("user"));
  const orgId = user?.org_id || user?.organization_id;

  console.log("🔍 DEBUG - Current user:", user);
  console.log("🔍 DEBUG - Organization ID:", orgId);

  // API hooks
  const { data: joinRequests, isLoading: isLoadingRequests } = useListJoinRequests();
  const { data: orgUsers, isLoading: isLoadingUsers } = useListOrgUsers(orgId);

  console.log("🔍 DEBUG - Join Requests Data:", joinRequests);
  console.log("🔍 DEBUG - Organization Users Data:", orgUsers);
  console.log("🔍 DEBUG - Is Loading Users:", isLoadingUsers);

  const approveMutation = useApproveJoinRequest();
  const rejectMutation = useRejectJoinRequest();
  const removeMutation = useRemoveUserFromOrg();
  const changeRoleMutation = useChangeUserRole();

  // Handlers
  const handleApprove = async (userId) => {
    console.log("🟢 DEBUG - Approving user ID:", userId);
    setApprovingId(userId);
    try {
      const result = await approveMutation.mutateAsync({ target_user_id: userId });
      console.log("🟢 DEBUG - Approve mutation result:", result);
      
      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ["joinRequests"] });
      console.log("🟢 DEBUG - Invalidated joinRequests query");
      
      await queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
      console.log("🟢 DEBUG - Invalidated orgUsers query");

      // Force refetch to see new data
      const newJoinRequests = await queryClient.refetchQueries({ queryKey: ["joinRequests"] });
      const newOrgUsers = await queryClient.refetchQueries({ queryKey: ["orgUsers"] });
      
      console.log("🟢 DEBUG - After refetch - New join requests:", newJoinRequests);
      console.log("🟢 DEBUG - After refetch - New org users:", newOrgUsers);

      toast.success("User approved successfully");
    } catch (error) {
      console.error("🔴 DEBUG - Approve error:", error);
      console.log("🔴 DEBUG - Approve error response:", error.response);
      toast.error("Failed to approve user");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (userId) => {
    setRejectingId(userId);
    try {
      await rejectMutation.mutateAsync({ target_user_id: userId });
      queryClient.invalidateQueries({ queryKey: ["joinRequests"] });
      toast.success("User request rejected");
    } catch (error) {
      toast.error("Failed to reject user");
    } finally {
      setRejectingId(null);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!confirm("Are you sure you want to remove this user from the organization?")) return;
    setRemovingId(userId);
    try {
      await removeMutation.mutateAsync(userId);
      queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
      toast.success("User removed successfully");
    } catch (error) {
      toast.error("Failed to remove user");
    } finally {
      setRemovingId(null);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    setChangingRoleId(userId);
    try {
      await changeRoleMutation.mutateAsync({ target_user_id: userId, role: newRole });
      queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
      toast.success("User role updated successfully");
    } catch (error) {
      toast.error("Failed to update user role");
    } finally {
      setChangingRoleId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage join requests and organization users.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pending Requests Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pending Join Requests</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRequests ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : joinRequests && joinRequests?.join_requests?.length > 0 ? (
                  joinRequests?.join_requests?.map((request) => (
                    <TableRow key={request.user_id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>
                        {request.created_at ? format(new Date(request.created_at), "MMM dd, yyyy") : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.user_id)}
                            disabled={approvingId === request.user_id}
                          >
                            {approvingId === request.user_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(request.user_id)}
                            disabled={rejectingId === request.user_id}
                          >
                            {rejectingId === request.user_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Reject"
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No pending requests
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Current Users Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Organization Users</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingUsers ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : orgUsers && orgUsers.length > 0 ? (
                  orgUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role || "user"}
                          onValueChange={(newRole) => handleChangeRole(user.user_id, newRole)}
                          disabled={changingRoleId === user.user_id}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveUser(user.user_id)}
                          disabled={removingId === user.user_id}
                        >
                          {removingId === user.user_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}