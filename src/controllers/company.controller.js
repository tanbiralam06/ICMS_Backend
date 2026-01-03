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
    // If files are uploaded, get their paths
    let logoUrl = "";
    let signatureUrl = "";

    if (req.files && req.files.logo) {
      // Store relative path for serving via static middleware
      // Assuming 'src/public' is served at root or /static
      // We'll store path like: /uploads/company/filename.ext
      logoUrl = "/public/uploads/company/" + req.files.logo[0].filename;
    }

    if (req.files && req.files.signature) {
      signatureUrl =
        "/public/uploads/company/" + req.files.signature[0].filename;
    }

    // Check if profile exists
    let profile = await CompanyProfile.findOne();

    const updateData = {
      ...req.body,
    };

    // Only update URLs if new files were uploaded
    if (logoUrl) updateData.logoUrl = logoUrl;
    if (signatureUrl) updateData.signatureUrl = signatureUrl;

    if (profile) {
      // Update existing
      // If we are replacing an image, we could delete the old one here to save space,
      // but let's separate that concern for now.
      Object.assign(profile, updateData);
      await profile.save();
      return res
        .status(200)
        .json({ message: "Company profile updated successfully", profile });
    } else {
      // Create new
      const newProfile = new CompanyProfile({
        ...updateData,
        logoUrl: logoUrl, // might be empty string if not uploaded, but that's allowed by model
        signatureUrl: signatureUrl,
      });
      await newProfile.save();
      return res.status(201).json({
        message: "Company profile created successfully",
        profile: newProfile,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error updating company profile",
      error: error.message,
    });
  }
};
