import CompanyProfile from "../models/company.model.js";
import fs from "fs";
import path from "path";

export const getCompanyProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne();
    if (!profile) {
      return res
        .status(404)
        .json({ message: "Company profile not set up yet." });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching company profile",
      error: error.message,
    });
  }
};

export const upsertCompanyProfile = async (req, res) => {
  try {
    // Convert uploaded files to Base64 data URIs
    let logoBase64 = "";
    let signatureBase64 = "";

    if (req.files && req.files.logo && req.files.logo[0]) {
      const logoFile = req.files.logo[0];
      const base64String = logoFile.buffer.toString("base64");
      logoBase64 = `data:${logoFile.mimetype};base64,${base64String}`;
    }

    if (req.files && req.files.signature && req.files.signature[0]) {
      const signatureFile = req.files.signature[0];
      const base64String = signatureFile.buffer.toString("base64");
      signatureBase64 = `data:${signatureFile.mimetype};base64,${base64String}`;
    }

    // Check if profile exists
    let profile = await CompanyProfile.findOne();

    // Exclude officeLocations from req.body - it has its own endpoint and
    // comes through FormData as "[object Object]" string which breaks validation
    const { officeLocations, ...safeBody } = req.body;
    
    const updateData = {
      ...safeBody,
    };

    // Only update Base64 fields if new files were uploaded
    if (logoBase64) updateData.logoBase64 = logoBase64;
    if (signatureBase64) updateData.signatureBase64 = signatureBase64;

    if (profile) {
      // Update existing
      Object.assign(profile, updateData);
      await profile.save();
      return res
        .status(200)
        .json({ message: "Company profile updated successfully", profile });
    } else {
      // Create new
      const newProfile = new CompanyProfile({
        ...updateData,
        logoBase64: logoBase64,
        signatureBase64: signatureBase64,
      });
      await newProfile.save();
      return res.status(201).json({
        message: "Company profile created successfully",
        profile: newProfile,
      });
    }
  } catch (error) {
    console.error("Error in upsertCompanyProfile:", error);
    res.status(500).json({
      message: "Error updating company profile",
      error: error.message,
    });
  }
};

export const getMyIp = (req, res) => {
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip;
  res.status(200).json({ ip });
};

export const updateAllowedIps = async (req, res) => {
  try {
    const { allowedIps } = req.body;

    if (!Array.isArray(allowedIps)) {
      return res.status(400).json({ message: "allowedIps must be an array" });
    }

    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^[a-fA-F0-9:]+$/;
    for (const ip of allowedIps) {
      if (typeof ip !== "string" || !ipRegex.test(ip.trim())) {
        return res.status(400).json({ message: `Invalid IP address: ${ip}` });
      }
    }

    let profile = await CompanyProfile.findOne();

    if (!profile) {
      profile = new CompanyProfile({
        companyName: "Company",
        address: "Address",
        signatoryName: "Signatory",
        bankName: "Bank",
        accountHolderName: "Account Holder",
        branch: "Branch",
        accountNumber: "0000000000",
        ifscCode: "XXXX0000000",
        allowedIps: allowedIps.map((ip) => ip.trim()),
      });
    } else {
      profile.allowedIps = allowedIps.map((ip) => ip.trim());
    }

    await profile.save();

    res.status(200).json({
      message: "Allowed IPs updated successfully",
      allowedIps: profile.allowedIps,
      updatedAt: profile.updatedAt,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating allowed IPs",
      error: error.message,
    });
  }
};

export const updateOfficeLocations = async (req, res) => {
  try {
    const { officeLocations } = req.body;

    if (!Array.isArray(officeLocations)) {
      return res.status(400).json({
        message: "officeLocations must be an array",
      });
    }

    // Validate each location
    for (const loc of officeLocations) {
      if (!loc.name || loc.latitude === undefined || loc.longitude === undefined) {
        return res.status(400).json({
          message: "Each location must have name, latitude, and longitude",
        });
      }
    }

    let profile = await CompanyProfile.findOne();

    if (!profile) {
      // Create a minimal profile if none exists
      profile = new CompanyProfile({
        companyName: "Company",
        address: "Address",
        signatoryName: "Signatory",
        bankName: "Bank",
        accountHolderName: "Account Holder",
        branch: "Branch",
        accountNumber: "0000000000",
        ifscCode: "XXXX0000000",
        officeLocations,
      });
    } else {
      profile.officeLocations = officeLocations;
    }

    await profile.save();

    res.status(200).json({
      message: "Office locations updated successfully",
      officeLocations: profile.officeLocations,
      updatedAt: profile.updatedAt,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating office locations",
      error: error.message,
    });
  }
};
