"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Wrench, Laptop, FileText, Camera, ShieldCheck, Trash2, CheckCircle, AlertCircle, Loader2, Upload } from "lucide-react";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { submitRepairRequest, RepairPayload } from "@/lib/redux/slices/repairSlice";
import Navbar from "@/components/Navbar";

export default function RepairRequestForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isSuccess } = useSelector(
    (state: RootState) => state.repair
  );

  // Form State
  const [device, setDevice] = useState({
    type: "",
    brand: "",
    model: "",
    serialNumber: "",
  });
  const [issueDescription, setIssueDescription] = useState("");
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  
  // File & Preview state
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // File change handler
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...selectedFiles]);

      // Create object URLs for local image previews
      const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setPreviews((prev) => {
      // Revoke the Object URL to avoid memory leaks
      URL.revokeObjectURL(prev[indexToRemove]);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  // Form Validation
  const validate = () => {
    const errors: Record<string, string> = {};

    if (!device.type.trim()) errors.type = "Device type is required";
    if (!device.brand.trim()) errors.brand = "Brand is required";
    if (!device.model.trim()) errors.model = "Model is required";
    if (!issueDescription.trim()) {
      errors.issueDescription = "Issue description is required";
    } else if (issueDescription.trim().length < 10) {
      errors.issueDescription = "Please describe the issue in at least 10 characters";
    }
    if (!privacyAcknowledged) {
      errors.privacyAcknowledged = "You must acknowledge privacy terms to submit";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: RepairPayload = {
      device,
      issueDescription,
      privacyAcknowledged,
      intakePhotos: photos, // Passing raw File[] array
    };

    dispatch(submitRepairRequest(payload));
  };

  if (isSuccess) {
    return (
      <>
      <Navbar />
      <div className="bg-white p-8 rounded-xl border border-navy-900/10 shadow-sm text-center max-w-lg mx-auto my-8">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-ink mb-2">Request Submitted!</h2>
        <p className="text-mist mb-6">
          Your repair request has been successfully logged. Our technical team will review the details and contact you shortly.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-gold hover:bg-gold/90 text-navy-900 font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          Submit Another Request
        </button>
      </div>
    </> 
    );
  }

  return (
    <>
      <Navbar />
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white border border-navy-900/10 shadow-sm rounded-xl p-6 sm:p-8 space-y-8 my-8"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold text-ink">New Repair Request</h2>
        </div>
        <p className="text-mist text-sm">
          Complete the details below to initiate your device intake process.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Device Details Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-navy-900/10 pb-2">
          <Laptop className="w-5 h-5 text-ink" />
          <h3 className="text-lg font-semibold text-ink">1. Device Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Device Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Smartphone, Laptop"
              value={device.type}
              onChange={(e) => setDevice({ ...device, type: e.target.value })}
              className="w-full bg-paper text-ink border border-navy-900/10 rounded-md p-2.5 outline-none focus:border-gold transition-colors text-sm"
            />
            {formErrors.type && (
              <p className="text-xs text-red-500 mt-1">{formErrors.type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Brand <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Apple, Samsung, Dell"
              value={device.brand}
              onChange={(e) => setDevice({ ...device, brand: e.target.value })}
              className="w-full bg-paper text-ink border border-navy-900/10 rounded-md p-2.5 outline-none focus:border-gold transition-colors text-sm"
            />
            {formErrors.brand && (
              <p className="text-xs text-red-500 mt-1">{formErrors.brand}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. iPhone 13, XPS 15"
              value={device.model}
              onChange={(e) => setDevice({ ...device, model: e.target.value })}
              className="w-full bg-paper text-ink border border-navy-900/10 rounded-md p-2.5 outline-none focus:border-gold transition-colors text-sm"
            />
            {formErrors.model && (
              <p className="text-xs text-red-500 mt-1">{formErrors.model}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Serial / IMEI Number
            </label>
            <input
              type="text"
              placeholder="Optional"
              value={device.serialNumber}
              onChange={(e) => setDevice({ ...device, serialNumber: e.target.value })}
              className="w-full bg-paper text-ink border border-navy-900/10 rounded-md p-2.5 outline-none focus:border-gold transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. Issue Description Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-navy-900/10 pb-2">
          <FileText className="w-5 h-5 text-ink" />
          <h3 className="text-lg font-semibold text-ink">2. Problem Description</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Describe the issue <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Please detail symptoms, error messages, or physical damage..."
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            className="w-full bg-paper text-ink border border-navy-900/10 rounded-md p-2.5 outline-none focus:border-gold transition-colors text-sm resize-none"
          />
          {formErrors.issueDescription && (
            <p className="text-xs text-red-500 mt-1">{formErrors.issueDescription}</p>
          )}
        </div>
      </div>

      {/* 3. Intake Photos Section (Binary File Input) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-navy-900/10 pb-2">
          <Camera className="w-5 h-5 text-ink" />
          <h3 className="text-lg font-semibold text-ink">
            3. Intake Photos <span className="text-mist text-sm font-normal">(Optional)</span>
          </h3>
        </div>

        <p className="text-xs text-mist">
          Upload images showing the current physical condition of the device.
        </p>

        {/* Binary File Input Box */}
        <div className="relative border-2 border-dashed border-navy-900/20 hover:border-gold rounded-lg p-4 transition-colors bg-paper text-center cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <Upload className="w-8 h-8 text-mist" />
            <p className="text-sm font-medium text-ink">
              Click or drag files here to upload
            </p>
            <p className="text-xs text-mist">PNG, JPG, JPEG, or WEBP files</p>
          </div>
        </div>

        {/* Local Image Previews Grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {previews.map((src, idx) => (
              <div
                key={idx}
                className="relative group border border-navy-900/10 rounded-md overflow-hidden bg-paper aspect-video flex items-center justify-center p-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Intake condition photo ${idx + 1}`}
                  className="object-cover w-full h-full rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity shadow"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Privacy Acknowledgement */}
      <div className="space-y-2 pt-2 border-t border-navy-900/10">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={privacyAcknowledged}
            onChange={(e) => setPrivacyAcknowledged(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-navy-900/10 accent-amber-500 focus:border-gold"
          />
          <span className="text-sm text-mist leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-navy-900 inline mr-1" />
            I acknowledge that personal data on the device may be accessed during inspection, and I confirm I have backed up critical data before submitting. <span className="text-red-500">*</span>
          </span>
        </label>
        {formErrors.privacyAcknowledged && (
          <p className="text-xs text-red-500">{formErrors.privacyAcknowledged}</p>
        )}
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gold hover:bg-gold/90 text-navy-900 font-bold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Submitting Request...</span>
          </>
        ) : (
          <span>Submit Repair Request</span>
        )}
      </button>
    </form>
   </> 
  );
}