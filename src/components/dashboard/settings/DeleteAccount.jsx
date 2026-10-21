import { useState } from "react";
import { Link } from "react-router-dom";
import axiosDefault from "axios";
import { clearSession } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { toast } from "react-toastify";
import { endpoints } from "../../config/endpoints";
import { axios } from "../../../lib/axios";
import Button from "@/components/shared/Button";
import DeleteAccountModal from "./DeleteAccountModal";
import SuccessModal from "./Success";

const DeleteAccount = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // axios rejects non-2xx responses, so reaching here means success (incl. 204)
      await axios.delete(endpoints().users.profile);
      clearSession();
      queryClient.clear();
      toast.success("Account deleted successfully");
      setIsDeleteModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      if (axiosDefault.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "Account deletion failed");
      } else {
        toast.error("Unable to connect to the server");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="w-full space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Delete Your Account
        </h2>
        <p className="text-sm text-gray-600">
          You’re about to start the process of deactivating your BigFarma
          account and your public profile will no longer be available on
          BigFarma.com
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
            You can restore your BigFarma account if it was accidentally or
            wrongfully deactivated for up to 30 days after deactivation
          </div>

          <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
            If you just want to change your name, you don’t need to deactivate
            your account, edit it in your{" "}
            <Link to="/settings" className="font-medium text-primary underline">
              settings
            </Link>
          </div>
        </div>

        <Button
          onClick={() => setIsDeleteModalOpen(true)}
          className="h-12 w-full py-0"
        >
          Delete Account
        </Button>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />

      <SuccessModal
        message="Congratulations your account has been successfully deleted"
        isOpen={isSuccessModalOpen}
        path="/"
      />
    </>
  );
};

export default DeleteAccount;
