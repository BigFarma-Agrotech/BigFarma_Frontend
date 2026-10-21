import { useState } from "react";
import { toast } from "react-toastify";
import axiosDefault from "axios";
import Button from "@/components/shared/Button";
import {
  modalOverlayClass,
  modalPanelClass,
  primaryButtonClass,
  subtitleClass,
  titleClass,
} from "@/components/auth/authStyles";
import { cn } from "@/lib/utils";
import fileIcon from "@/assets/icons/fileIcon.png";
import { endpoints } from "../../../config/endpoints";
import { axios } from "../../../../lib/axios";

const IdentityVerification = ({ onNext }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (isUploading) return;

    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    try {
      const payload = {
        id_document: await toBase64(file),
      };

      const res = await axios.put(
        endpoints().users.update_farmer_profile,
        payload,
      );
      const data = res.data;
      if (res.status === 200 || res.status === 201) {
        toast.success(data?.message || "ID uploaded successfully!");
        onNext(data);
      } else {
        toast.error(data?.message || "Upload failed. Please try again.");
      }
    } catch (error) {
      // Surface the failure and stay on this step.
      console.error("Error:", error);
      if (axiosDefault.isAxiosError(error) && error.response) {
        toast.error(
          error.response.data?.detail ||
            error.response.data?.message ||
            "Upload failed. Please try again.",
        );
      } else if (axiosDefault.isAxiosError(error)) {
        toast.error("Unable to connect to the server");
      } else {
        toast.error("Couldn't read the selected file. Please try another.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={modalOverlayClass}>
      <div className={modalPanelClass}>
        <h2 className={titleClass}>Identity Verification</h2>
        <p className={subtitleClass}>
          Please upload a valid government-issued ID to confirm your identity.
          This helps us keep our marketplace safe and trustworthy for everyone.
        </p>

        {/* Drag & Drop Area */}
        <label
          htmlFor="idUpload"
          className={cn(
            "mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors sm:p-10",
            dragActive
              ? "border-primary bg-primary-subtle"
              : "border-grey-100 hover:border-primary",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <img src={fileIcon} alt="" className="mb-3" />
          <span className="text-sm text-grey-300">
            Drag and drop a file here, or{" "}
            <span className="ml-1 inline-block rounded bg-grey-100 px-2 py-0.5 font-medium text-text-neutral">
              browse
            </span>
          </span>
          <input
            id="idUpload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          {file && (
            <span className="mt-3 break-all text-sm font-medium text-primary">
              Selected: {file.name}
            </span>
          )}
        </label>

        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className={cn(primaryButtonClass, "mt-6")}
        >
          {isUploading ? "Uploading..." : "Upload ID"}
        </Button>
      </div>
    </div>
  );
};

export default IdentityVerification;
