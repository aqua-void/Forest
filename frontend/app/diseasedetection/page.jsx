
'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Upload,
  Camera,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Pill,
  TrendingUp,
  DollarSign,
  Save,
  MapPin,
  Database,
  Globe,
  Check,
  Clock,
  User,
  LogOut,
  History,
  Trash2,
  X,
  FileText,
  Calendar,
  Shield,
  AlertCircle,
  ShoppingCart,
  Info,
  ShieldAlert,
  Thermometer,
  Droplets,
  Bug,
  Sprout,
  Bot,
} from "lucide-react";
import { supabase } from "@/services/superbaseClient";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function DiseaseDetection() {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [reportStatus, setReportStatus] = useState(null);
  const [analysisStage, setAnalysisStage] = useState("idle");
  const [uploadResult, setUploadResult] = useState(null);
  const [hasReceivedResult, setHasReceivedResult] = useState(false);
  const [user, setUser] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const fileInputRef = useRef(null);
  const wsRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Check user authentication on mount
  useEffect(() => {
    checkUser();
  }, []);

  // Fetch user reports when user changes
  useEffect(() => {
    if (user) {
      fetchUserReports();
    }
  }, [user]);

  // WebSocket setup for real-time updates
  useEffect(() => {
    if (!reportId || hasReceivedResult) return;

    const connectWebSocket = () => {
      const clientId = `user_${reportId}`;
      const wsUrl = BACKEND_URL.replace(/^http/, "ws") + `/ws/${clientId}`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connected for report:", reportId);
          setAnalysisStage("waiting_for_analysis");
          toast.info("Image uploaded! Waiting for analysis...");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("WebSocket message received:", data);

            if (data.type === "report_result" && data.report_id === reportId) {
              handleWorkerResult(data);
              setAnalysisStage("completed");
              setHasReceivedResult(true);
            }

            if (data.type === "status_update") {
              setReportStatus(data.status);
              toast.info(`Status: ${data.status}`);
            }
          } catch (error) {
            console.error("WebSocket message error:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          toast.error("Connection error");
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected");
        };

        return () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        };
      } catch (error) {
        console.error("WebSocket connection failed:", error);
      }
    };

    connectWebSocket();

    // Also poll for status as fallback
    if (reportId && !hasReceivedResult) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      pollIntervalRef.current = setInterval(() => {
        checkReportStatus(reportId);
      }, 5000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [reportId, hasReceivedResult]);

  // Function to format JSON data into readable text with all fields
  const formatJSONToText = (jsonData) => {
    if (!jsonData) return "No data available";

    try {
      const lines = [];

      // SECTION 1: BASIC PREDICTION INFORMATION
      lines.push('=== BASIC PREDICTION ===');
      if (jsonData.success !== undefined) {
        lines.push(`• Analysis Successful: ${jsonData.success ? '✅ Yes' : '❌ No'}`);
      }

      // Prediction details - Try multiple paths for robustness
      const prediction = jsonData.prediction || {};
      if (prediction.crop) lines.push(`• Crop: ${prediction.crop}`);
      if (prediction.disease) lines.push(`• Disease: ${prediction.disease}`);
      if (prediction.confidence !== undefined) {
        const conf = typeof prediction.confidence === 'number' ? prediction.confidence : parseFloat(prediction.confidence);
        lines.push(`• Confidence: ${isNaN(conf) ? prediction.confidence : conf.toFixed(2)}%`);
      }
      if (prediction.message) lines.push(`• Message: ${prediction.message}`);

      // If no prediction object, try fallback fields
      if (!prediction.disease && jsonData.disease) {
        lines.push(`• Disease: ${jsonData.disease}`);
      }
      if (!prediction.crop && jsonData.crop) {
        lines.push(`• Crop: ${jsonData.crop}`);
      }
      if (!prediction.confidence && jsonData.confidence) {
        const conf = typeof jsonData.confidence === 'number' ? jsonData.confidence : parseFloat(jsonData.confidence);
        lines.push(`• Confidence: ${isNaN(conf) ? jsonData.confidence : (conf > 1 ? conf : (conf * 100).toFixed(2))}%`);
      }

      // SECTION 2: DISEASE INFORMATION
      if (jsonData.disease_info) {
        lines.push('\n=== DISEASE INFORMATION ===');

        // Basic disease info
        if (jsonData.disease_info.disease) lines.push(`• Disease Name: ${jsonData.disease_info.disease}`);
        if (jsonData.disease_info.info) lines.push(`• Description: ${jsonData.disease_info.info}`);
        if (jsonData.disease_info.cause) lines.push(`• Cause: ${jsonData.disease_info.cause}`);

        // Symptoms
        if (jsonData.disease_info.symptoms && Array.isArray(jsonData.disease_info.symptoms) && jsonData.disease_info.symptoms.length > 0) {
          lines.push('\n• Symptoms:');
          jsonData.disease_info.symptoms.forEach((symptom, index) => {
            lines.push(`  ${index + 1}. ${symptom}`);
          });
        }

        // Prevention
        if (jsonData.disease_info.prevention) {
          lines.push(`\n• Prevention: ${jsonData.disease_info.prevention}`);
        }

        // Treatment
        if (jsonData.disease_info.treatment) {
          lines.push(`\n• Treatment: ${jsonData.disease_info.treatment}`);
        }

        // Other information
        if (jsonData.disease_info.other) {
          lines.push(`\n• Additional Notes: ${jsonData.disease_info.other}`);
        }

        // Recommended Products
        if (jsonData.disease_info.recommendedProduct && Array.isArray(jsonData.disease_info.recommendedProduct) && jsonData.disease_info.recommendedProduct.length > 0) {
          lines.push('\n• Recommended Products:');
          jsonData.disease_info.recommendedProduct.forEach((product, index) => {
            lines.push(`  ${index + 1}. ${product.name}`);
            if (product.image) lines.push(`     Image: ${product.image}`);
          });
        }
      }

      // SECTION 3: DETECTION DETAILS
      lines.push('\n=== DETECTION DETAILS ===');
      if (jsonData.bbox) {
        lines.push(`• Bounding Box Coordinates:`);
        lines.push(`  - X: ${jsonData.bbox[0]}`);
        lines.push(`  - Y: ${jsonData.bbox[1]}`);
        lines.push(`  - Width: ${jsonData.bbox[2]}`);
        lines.push(`  - Height: ${jsonData.bbox[3]}`);
      }

      // SECTION 4: TECHNICAL METADATA
      lines.push('\n=== TECHNICAL METADATA ===');
      if (jsonData.timestamp) lines.push(`• Timestamp: ${new Date(jsonData.timestamp).toLocaleString()}`);
      if (jsonData.processing_time) lines.push(`• Processing Time: ${jsonData.processing_time} seconds`);
      if (jsonData.model_version) lines.push(`• Model Version: ${jsonData.model_version}`);
      if (jsonData.detection_count) lines.push(`• Total Detections: ${jsonData.detection_count}`);

      // Image information
      if (jsonData.image_url) lines.push(`• Image URL: ${jsonData.image_url}`);
      if (jsonData.image_size) lines.push(`• Image Size: ${jsonData.image_size} pixels`);

      // SECTION 5: ADDITIONAL METADATA
      if (jsonData.metadata) {
        lines.push('\n=== UPLOAD METADATA ===');
        if (jsonData.metadata.original_name) lines.push(`• Original Filename: ${jsonData.metadata.original_name}`);
        if (jsonData.metadata.size) lines.push(`• File Size: ${(jsonData.metadata.size / 1024).toFixed(2)} KB`);
        if (jsonData.metadata.type) lines.push(`• File Type: ${jsonData.metadata.type}`);
        if (jsonData.metadata.upload_time) lines.push(`• Upload Time: ${new Date(jsonData.metadata.upload_time).toLocaleString()}`);
      }

      // Report ID
      if (jsonData.report_id) {
        lines.push('\n=== REPORT ID ===');
        lines.push(`• Report ID: ${jsonData.report_id}`);
      }

      // Return formatted text
      return lines.join('\n');
    } catch (error) {
      console.error('Error formatting JSON:', error);

      // Fallback to simple JSON stringify if formatting fails
      try {
        return JSON.stringify(jsonData, null, 2);
      } catch (e) {
        return "Error: Could not format data";
      }
    }
  };

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        setUser(user);

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUser(prev => ({ ...prev, ...profile }));
        }
      } else {
        // No user found; do not redirect here — authentication is handled globally in the navbar
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      // Don't redirect from this page; leave it to the navbar/global auth
    }
  };

  const fetchUserReports = async () => {
    if (!user) return;

    try {
      setLoadingReports(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUserReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoadingReports(false);
    }
  };

  const deleteReport = async (reportId) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Report deleted successfully');
      fetchUserReports(); // Refresh the list
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
        setShowReportModal(false);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const viewReportDetails = (report) => {
    try {
      // Parse JSON data from string if needed
      let parsedAnalysisData = {};
      try {
        if (typeof report.analysis_data === 'string') {
          parsedAnalysisData = JSON.parse(report.analysis_data);
        } else {
          parsedAnalysisData = report.analysis_data || {};
        }
      } catch (e) {
        console.error('Error parsing analysis_data:', e);
      }

      let parsedTreatments = [];
      try {
        if (typeof report.treatments === 'string') {
          parsedTreatments = JSON.parse(report.treatments);
        } else {
          parsedTreatments = report.treatments || [];
        }
      } catch (e) {
        console.error('Error parsing treatments:', e);
      }

      let parsedSymptoms = [];
      try {
        if (typeof report.symptoms === 'string') {
          parsedSymptoms = JSON.parse(report.symptoms);
        } else {
          parsedSymptoms = report.symptoms || [];
        }
      } catch (e) {
        console.error('Error parsing symptoms:', e);
      }

      let parsedRecommendedProducts = [];
      try {
        if (typeof report.recommended_products === 'string') {
          parsedRecommendedProducts = JSON.parse(report.recommended_products);
        } else {
          parsedRecommendedProducts = report.recommended_products || [];
        }
      } catch (e) {
        console.error('Error parsing recommended products:', e);
      }

      // Derive common top-level fields from analysis_data for easier UI consumption
      const diseaseFromAnalysis = parsedAnalysisData.prediction?.disease || parsedAnalysisData.disease || report.disease_name || null;
      const cropFromAnalysis = parsedAnalysisData.prediction?.crop || parsedAnalysisData.crop || report.crop || report.crop_type || null;
      const confidenceFromAnalysis = parsedAnalysisData.prediction?.confidence ?? parsedAnalysisData.confidence ?? report.confidence_score ?? null;

      // Ensure treatments/symptoms/recommendedProducts fall back to analysis_data.disease_info when absent
      const fallbackTreatments = parsedAnalysisData.disease_info?.treatment || parsedAnalysisData.disease_info?.treatments || null;
      const finalTreatments = (parsedTreatments && parsedTreatments.length) ? parsedTreatments : (Array.isArray(fallbackTreatments) ? fallbackTreatments : fallbackTreatments ? [fallbackTreatments] : []);

      const fallbackSymptoms = parsedAnalysisData.disease_info?.symptoms || null;
      const finalSymptoms = (parsedSymptoms && parsedSymptoms.length) ? parsedSymptoms : (Array.isArray(fallbackSymptoms) ? fallbackSymptoms : fallbackSymptoms ? [fallbackSymptoms] : []);

      const fallbackRecommended = parsedAnalysisData.disease_info?.recommendedProduct || parsedAnalysisData.disease_info?.recommended_products || null;
      const finalRecommended = (parsedRecommendedProducts && parsedRecommendedProducts.length) ? parsedRecommendedProducts : (Array.isArray(fallbackRecommended) ? fallbackRecommended : fallbackRecommended ? [fallbackRecommended] : []);

      const preventionFromAnalysis = parsedAnalysisData.disease_info?.prevention || parsedAnalysisData.prevention || report.prevention || null;
      const causeFromAnalysis = parsedAnalysisData.disease_info?.cause || parsedAnalysisData.cause || report.cause || null;
      const additionalNotes = report.additional_notes || parsedAnalysisData.disease_info?.other || parsedAnalysisData.additionalNotes || null;
      const estimatedCost = report.estimated_cost || parsedAnalysisData.disease_info?.estimatedCost || parsedAnalysisData.estimated_cost || null;

      const formattedReport = {
        ...report,
        analysis_data: parsedAnalysisData,
        // Normalized properties for template
        disease: diseaseFromAnalysis,
        crop_type: cropFromAnalysis,
        confidence_raw: confidenceFromAnalysis,
        treatments: finalTreatments,
        symptoms: finalSymptoms,
        recommendedProducts: finalRecommended,
        prevention: preventionFromAnalysis,
        cause: causeFromAnalysis,
        additional_notes: additionalNotes,
        estimated_cost: estimatedCost,
        formattedDate: new Date(report.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        // Normalize confidence to an integer percentage (0-100)
        confidencePercentage: (() => {
          // Prefer explicit report.confidence_score (stored as fraction 0-1), then analysis prediction
          const raw = report.confidence_score ?? confidenceFromAnalysis ?? 0;
          let num = typeof raw === 'string' ? parseFloat(raw) : raw;
          if (isNaN(num) || num === null) return 0;
          // If the value looks like a fraction (<= 1), convert to percentage
          if (num > 0 && num <= 1) {
            return Math.round(num * 100);
          }
          // If value already seems like a percent (e.g., 85), clamp and round
          return Math.round(num);
        })()
      };

      setSelectedReport(formattedReport);
      setShowReportModal(true);
    } catch (error) {
      console.error('Error formatting report:', error);
      toast.error('Failed to load report details');
    }
  };


  const checkReportStatus = async (id) => {
    if (hasReceivedResult) return;

    try {
      const response = await fetch(`${BACKEND_URL}/reports/${id}/status`);
      if (response.ok) {
        const data = await response.json();
        setReportStatus(data.status);

        if (data.status === "completed" && data.result && !hasReceivedResult) {
          handleWorkerResult(data.result);
          setAnalysisStage("completed");
          setHasReceivedResult(true);

          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }
    } catch (error) {
      console.log("Status poll error:", error);
    }
  };

  const handleWorkerResult = async (data) => {
    console.log("Processing worker result:", data);

    if (hasReceivedResult) return;

    // Extract disease info from the backend response
    const diseaseInfo = data.disease_info || {};
    const prediction = data.prediction || {};

    // Format result for UI using only API-provided data (no hardcoded fallbacks)
    const formattedResult = {
      disease: prediction.disease || data.disease,
      crop: prediction.crop || data.crop || diseaseInfo.crop || null,
      confidence: prediction.confidence ? Math.round(prediction.confidence) : Math.round((data.confidence || 0) * 100),
      severity: data.severity || diseaseInfo.severity || "medium",
      // Use only values provided by the backend / AI
      description: diseaseInfo.info || null,
      // Normalise treatments: API may return a single string or an array
      treatments: Array.isArray(diseaseInfo.treatment)
        ? diseaseInfo.treatment
        : diseaseInfo.treatment
          ? [diseaseInfo.treatment]
          : (diseaseInfo.treatments && Array.isArray(diseaseInfo.treatments) ? diseaseInfo.treatments : []),
      prevention: diseaseInfo.prevention || null,
      cause: diseaseInfo.cause || null,
      symptoms: diseaseInfo.symptoms || [],
      recommendedProducts: diseaseInfo.recommendedProduct || [],
      additionalNotes: diseaseInfo.other || null,
      // estimatedCost must come from API if available; otherwise leave null
      estimatedCost: diseaseInfo.estimatedCost || null,
      imageUrl: data.image_url || uploadResult?.url,
      bbox: data.bbox,
      rawData: data,
      // Format JSON data for text display
      formattedData: formatJSONToText(data)
    };

    setResult(formattedResult);
    setIsAnalyzing(false);
    setAnalysisStage("completed");
    setHasReceivedResult(true);
    toast.success(`Analysis complete: ${prediction.message || `${prediction.disease || data.disease} detected!`}`);

    // Save report to Supabase
    await saveReportToSupabase(data, formattedResult);

    // Clean up
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const saveReportToSupabase = async (backendData, formattedResult) => {
    if (!user) {
      toast.error('Please login to save report');
      return null;
    }

    try {
      // Validate Supabase auth session before attempting insert
      const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser();

      if (sessionError || !sessionUser) {
        console.warn('Auth session invalid for save:', sessionError?.message);
        toast.error('Your session expired. Please sign in again to save reports.');
        return null;
      }

      console.log('Attempting to save report to Supabase...');
      console.log('User ID:', user.id);
      console.log('Report ID (state):', reportId);
      console.log('Formatted result:', formattedResult);

      // Prefer report_id returned by backend, fallback to state reportId
      const finalReportId = backendData?.report_id || reportId || formattedResult.report_id || null;

      const safeStringify = (v) => {
        try {
          if (v === undefined || v === null) return null;
          return JSON.stringify(v);
        } catch (e) {
          console.error('Stringify error', e);
          return null;
        }
      };

      // Build payload matching your Supabase `reports` table schema
      // Required by schema: user_id (uuid), image_url (text NOT NULL), disease_name (varchar NOT NULL)
      const reportData = {
        user_id: user.id,
        image_url: backendData.image_url || uploadResult?.url || '', // NOT NULL in schema
        disease_name: formattedResult.disease || 'Unknown', // NOT NULL in schema
        confidence_score: formattedResult.confidence ? formattedResult.confidence / 100 : 0,
        severity: formattedResult.severity || 'medium',
        description: formattedResult.description || null,
        // `treatments` is jsonb in schema — send an array/object (do NOT stringify)
        treatments: formattedResult.treatments && formattedResult.treatments.length ? formattedResult.treatments : null,
        estimated_cost: formattedResult.estimatedCost ?? null,
        // analysis_data is jsonb — include the raw backendData object
        analysis_data: backendData || {},
        status: 'completed',
        report_id: finalReportId,
      };

      console.log('Prepared report data:', reportData);

      const { data: inserted, error } = await supabase
        .from('reports')
        .insert([reportData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error details:', error);
        // Check for RLS policy violation
        if (error.message && error.message.includes('row-level security')) {
          toast.error('Unable to save report. Please try signing in again.');
        } else if (error.message && error.message.includes('NOT NULL')) {
          toast.error('Missing required information. Please try again.');
        } else {
          toast.error('Failed to save report: ' + error.message);
        }
        throw error;
      }

      console.log('Report saved successfully to Supabase:', inserted);
      toast.success('Report saved to history');

      // Refresh reports list
      await fetchUserReports();
      return inserted;
    } catch (error) {
      console.error('Error saving report to Supabase:', error);
      toast.error(`Failed to save report: ${error?.message || JSON.stringify(error)}`);
      return null;
    }
  };

  const uploadToBucket = async (file) => {
    if (!user) {
      toast.error("Please sign in to upload images");
      return null;
    }

    if (!file) return null;

    setIsUploading(true);
    setAnalysisStage("uploading");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const ownerId = user?.id || 'anonymous';
      const filePath = `leaf-images/${ownerId}/${fileName}`;

      console.log('Uploading file to Supabase storage:', {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type
      });

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('leaf-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error("Supabase storage upload error:", error);
        toast.error(`Failed to upload image: ${error.message}`);
        return null;
      }

      // Get public URL from Supabase
      const { data: urlData } = supabase.storage
        .from('leaf-images')
        .getPublicUrl(filePath);

      const uploadResult = {
        path: filePath,
        url: urlData.publicUrl,
        fileName: fileName,
        timestamp: new Date().toISOString()
      };

      console.log('Upload successful:', uploadResult);
      setUploadResult(uploadResult);
      setAnalysisStage("upload_completed");
      toast.success("Image uploaded successfully!");

      return uploadResult;
    } catch (err) {
      console.error("Upload exception:", err);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const notifyBackend = async (imageInfo, farmId = "default_farm") => {
    try {
      console.log("Notifying backend with image info:", imageInfo);

      const response = await fetch(`${BACKEND_URL}/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || null,
          farm_id: farmId,
          image_path: imageInfo.path,
          image_url: imageInfo.url, // Send the public URL
          metadata: {
            original_name: imageFile?.name,
            size: imageFile?.size,
            type: imageFile?.type,
            upload_time: new Date().toISOString(),
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Backend error (${response.status}): ${errorText}`);
      }

      const responseData = await response.json();
      console.log("Backend response:", responseData);

      if (responseData.report_id) {
        setReportId(responseData.report_id);
        setAnalysisStage("queued");
        setHasReceivedResult(false);
        toast.success(`Analysis queued! Report ID: ${responseData.report_id}`);

        return {
          ...responseData,
          imageInfo: imageInfo
        };
      } else {
        throw new Error("No report ID in response");
      }
    } catch (error) {
      console.error("Backend notification error:", error);
      toast.error(`Failed to queue analysis: ${error.message}`);
      throw error;
    }
  };

  const analyzeImage = async () => {
    if (!user) {
      toast.error("Please sign in to analyze images");
      return;
    }

    if (!image || !imageFile) {
      toast.error("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setReportId(null);
    setReportStatus(null);
    setAnalysisStage("starting");
    setHasReceivedResult(false);
    setUploadResult(null);

    // Clean up existing connections
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    try {
      // Step 1: Upload to Supabase Storage
      setAnalysisStage("uploading");
      const uploadResult = await uploadToBucket(imageFile);
      if (!uploadResult) {
        setIsAnalyzing(false);
        setAnalysisStage("error");
        return;
      }

      // Step 2: Notify backend to start ML processing
      setAnalysisStage("notifying_backend");
      const backendResponse = await notifyBackend(uploadResult);

      console.log("Backend processing started:", backendResponse);

    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze image");
      setIsAnalyzing(false);
      setAnalysisStage("error");
    }
  };

  // Removed hardcoded disease helpers. UI now displays only API-provided data.

  const resetDetection = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setReportId(null);
    setReportStatus(null);
    setAnalysisStage("idle");
    setUploadResult(null);
    setHasReceivedResult(false);

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // const getStageInfo = () => {
  //   const stages = {
  //     idle: { icon: Camera, text: "Ready to upload", color: "text-gray-500" },
  //     starting: { icon: Upload, text: "Starting analysis", color: "text-blue-500" },
  //     uploading: { icon: Upload, text: "Uploading to cloud", color: "text-blue-500" },
  //     upload_completed: { icon: Check, text: "Upload completed", color: "text-green-500" },
  //     notifying_backend: { icon: Globe, text: "Notifying backend", color: "text-blue-500" },
  //     queued: { icon: Clock, text: "Queued for analysis", color: "text-yellow-500" },
  //     waiting_for_analysis: { icon: Loader2, text: "AI analyzing image", color: "text-purple-500" },
  //     completed: { icon: CheckCircle2, text: "Analysis complete", color: "text-green-500" },
  //     error: { icon: XCircle, text: "Analysis failed", color: "text-red-500" },
  //   };

  //   return stages[analysisStage] || stages.idle;
  // };

  return (
    <div className="min-h-screen pt-20 py-8 bg-[url('/bg2.jpg')] bg-cover bg-center bg-no-repeat
    overflow-hidden">
      <div className="container mx-auto px-20">
        {/* HEADER WITH USER INFO */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="text-center md:text-left text-white">
              <Badge variant="forest" className="mb-2 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-white">
                <Sparkles className="w-3 h-3 mr-1 text-white" />
                AI-Powered Detection
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Leaf Disease Detection
              </h1>
              <p className="text-gray-400">
                Upload a photo of your crop leaf and our AI will instantly identify diseases.
              </p>
            </div>
            <div>
              <div className="p-2 rounded-lg  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20">
                <Bot className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* LEFT SIDE: UPLOAD & STATUS */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card variant="elevated" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-white">
                    <Upload className="w-5 h-5 text-white" />
                    Upload Leaf Image
                  </div>
                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                      className={"text-white bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20 hover:text-white"}
                    >
                      <History className="w-4 h-4 mr-2 text-whit" />
                      {showHistory ? 'Hide History' : 'Show History'}
                    </Button>
                  )}
                </CardTitle>
                <CardDescription className={"text-gray-400"}>
                  {"Take a clear photo for best results"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* USER HISTORY PANEL */}
                <AnimatePresence>
                  {showHistory && user && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Card variant="glass" className="mb-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
                            <History className="w-4 h-4 text-white" />
                            Your Analysis History
                          </h3>

                          {loadingReports ? (
                            <div className="text-center py-4">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" />
                              <p className="text-sm text-white mt-2">Loading reports...</p>
                            </div>
                          ) : userReports.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-white">No reports yet</p>
                              <p className="text-sm text-white">Upload your first image to get started</p>
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-none">
                              {userReports.map((report) => (
                                <div
                                  key={report.id}
                                  onClick={() => viewReportDetails(report)}
                                  className="p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={
                                          report.severity === 'low' ? 'success' :
                                            report.severity === 'medium' ? 'warning' : 'danger'

                                        } className={"text-white"}>
                                          {report.disease_name}
                                        </Badge>
                                        <span className="text-xs text-white">
                                          {new Date(report.created_at).toLocaleDateString()}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs px-2 py-1 bg-primary/10 text-white rounded">
                                          Confidence: {Math.round((report.confidence_score || 0) * 100)}%
                                        </span>
                                        <span className="text-xs text-white flex items-center gap-1">
                                          <FileText className="w-3 h-3 text-white" />
                                          View Details
                                        </span>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteReport(report.id);
                                      }}
                                      className="h-8 w-8 p-0  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20"
                                    >
                                      <Trash2 className="w-3 h-3 text-white" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* UPLOAD AREA */}
                {!user ? (
                  <Card variant="glass" className="border-warning/50 bg-warning/5">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mb-4 mx-auto">
                        <AlertTriangle className="w-8 h-8 text-warning text-white" />
                      </div>
                      <p className="font-medium mb-2 text-white">Sign In Required</p>
                      <p className="text-sm text-white mb-4">
                        You need to sign in to upload and analyze plant images
                      </p>
                      <Button onClick={() => router.push('/auth')} className="w-full  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/10">
                        Sign In Now
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 min-h-[300px] flex flex-col items-center justify-center ${image ? "border-white bg-white/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
                      } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImage(reader.result);
                            setResult(null);
                            setReportId(null);
                            setAnalysisStage("idle");
                            setHasReceivedResult(false);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      disabled={isUploading || isAnalyzing}
                    />

                    <AnimatePresence mode="wait">
                      {image ? (
                        <motion.div key="preview" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full">
                          <img src={image} alt="Uploaded leaf" className="max-h-48 mx-auto rounded-lg object-contain" />
                          <Badge variant="success" className="mt-4 text-white">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-white" />
                            Image Ready
                          </Badge>
                        </motion.div>
                      ) : (
                        <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                            <Camera className="w-8 h-8 text-white" />
                          </div>
                          <p className="font-medium text-white">Click to upload</p>
                          <p className="text-sm text-gray-300">PNG, JPG up to 10MB</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* ANALYSIS STATUS */}
                {/* {isAnalyzing && (
                  <Card variant="glass">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full animate-pulse ${getStageInfo().color}`} />
                          <span className={`font-medium ${getStageInfo().color}`}>
                            {getStageInfo().text}
                          </span>
                        </div>
                        {analysisStage === "waiting_for_analysis" && (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        )}
                      </div>

                      <Progress
                        value={
                          analysisStage === "uploading" ? 25 :
                            analysisStage === "upload_completed" ? 50 :
                              analysisStage === "queued" ? 75 :
                                analysisStage === "waiting_for_analysis" ? 90 :
                                  analysisStage === "completed" ? 100 : 0
                        }
                        className="h-2"
                      />

                      {reportId && (
                        <div className="mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Database className="w-3 h-3" />
                            <span>Report ID: <strong>{reportId}</strong></span>
                          </div>
                          {reportStatus && (
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>Status: {reportStatus}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )} */}

                {/* UPLOADED IMAGE INFO */}
                {/* {uploadResult && !isAnalyzing && (
                  <Card variant="forest">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Uploaded Image Info
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">File:</span>
                          <span className="font-medium truncate max-w-[200px]">{uploadResult.fileName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Storage:</span>
                          <Badge variant="outline">Supabase Bucket</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Path:</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                            {uploadResult.path}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )} */}

                {/* ACTION BUTTONS */}
                <div className="flex gap-3">
                  <Button
                    onClick={analyzeImage}
                    disabled={!image || isAnalyzing || isUploading}
                    variant="hero"
                    className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-white hover:bg-white/20"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        Analyze Disease
                      </>
                    )}
                  </Button>

                  {image && (
                    <Button variant="outline" onClick={resetDetection} disabled={isAnalyzing} className={" bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20"}>
                      <RefreshCw className="w-4 h-4 text-white " />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* RIGHT SIDE: RESULTS */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <AnimatePresence mode="wait">
              {/* RESULTS DISPLAY */}
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card variant={result.severity === "low" ? "success" : result.severity === "medium" ? "warning" : "danger"} className="h-[493.6px] flex flex-col bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-2xl text-white">
                            {/* {result.disease === "Healthy" ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-6 h-6 text-amber-500" />
                            )} */}
                            {result.disease}
                          </CardTitle>
                        </div>

                        <Badge variant={result.severity === "low" ? "success" : result.severity === "medium" ? "warning" : "danger"} className={"text-white  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg"}>
                          {result.severity.toUpperCase()} SEVERITY
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="overflow-y-auto scrollbar-none flex-1 space-y-6">
                      {/* IMAGE FROM BACKEND */}
                      {result.imageUrl && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-white" />
                              <span className="text-sm font-medium text-white">Analyzed Image</span>
                            </div>
                          </div>
                          <img
                            src={result.imageUrl}
                            alt="Analyzed leaf"
                            className="rounded-lg w-full max-h-48 object-contain border"
                            onError={(e) => {
                              console.error("Failed to load image:", result.imageUrl);
                              e.target.src = image; // Fallback to original upload
                            }}
                          />
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Image processed and served by ML worker
                          </p>
                        </div>
                      )}

                      {/* CONFIDENCE SCORE */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium flex items-center gap-1 text-white">
                            <TrendingUp className="w-4 h-4 text-white" />
                            AI Confidence Score
                          </span>
                          <span className="text-sm font-bold text-white">{result.confidence}%</span>
                        </div>
                        <Progress value={result.confidence} className="h-2 [&>*]:bg-white " />
                      </div>

                      {/* Crop Name */}
                      {result.crop && (
                        <Badge variant="outline" className="mt-1 text-white  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
                          <Sprout className="w-3 h-3 mr-1 text-white" />
                          Crop: {result.crop}
                        </Badge>
                      )}

                      {/* Crop Description */}
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-white">Description</h4>
                      <CardDescription className="mt-2 p-3 rounded-lg text-white  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">{result.description}</CardDescription>

                      {/* SYMPTOMS */}
                      {result.symptoms && result.symptoms.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-white">
                            {/* <AlertTriangle className="w-4 h-4 text-amber-500" /> */}
                            Symptoms
                          </h4>
                          <div className="space-y-1">
                            {result.symptoms.map((symptom, index) => (
                              <div key={index} className="text-sm flex items-start gap-2 p-2 rounded  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-medium text-white">{index + 1}</span>
                                </div>
                                <span className="text-white">{symptom}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TREATMENTS */}
                      {result.treatments && result.treatments.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-white">
                            {/* <Pill className="w-4 h-4 text-primary" /> */}
                            Recommended Treatments
                          </h4>
                          <ul className="space-y-1">
                            {result.treatments.map((treatment, index) => (
                              <li key={index} className="text-sm flex items-start gap-2 p-3 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-white">
                                {/* <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" /> */}
                                <span>{treatment}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* PREVENTION */}
                      {result.prevention && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-white">
                            {/* <Shield className="w-4 h-4 text-blue-500" /> */}
                            Prevention
                          </h4>
                          <p className="text-sm p-3 rounded-lg  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-white">{result.prevention}</p>
                        </div>
                      )}

                      {/* CAUSE */}
                      {result.cause && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-white">
                            {/* <AlertCircle className="w-4 h-4 text-red-500" /> */}
                            Cause
                          </h4>
                          <p className="text-sm p-3 rounded-lg  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-white">{result.cause}</p>
                        </div>
                      )}

                      {/* RECOMMENDED PRODUCTS */}
                      {result.recommendedProducts && result.recommendedProducts.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-white">
                            {/* <ShoppingCart className="w-4 h-4 text-green-500" /> */}
                            Recommended Products
                          </h4>
                          <div className="space-y-2">
                            {result.recommendedProducts.map((product, index) => (
                              <div key={index} className="text-sm p-3 rounded-lg  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-white">
                                <div className="font-medium">{product.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ADDITIONAL NOTES */}
                      {result.additionalNotes && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-white">
                            {/* <Info className="w-4 h-4 text-purple-500" /> */}
                            Additional Notes
                          </h4>
                          <p className="text-sm p-3 rounded-lg  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-white">{result.additionalNotes}</p>
                        </div>
                      )}

                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card variant="glass" className="h-[493.6px]  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
                        <Leaf className="w-10 h-10 text-white " />
                      </div>
                      <p className="font-semibold mb-2 text-white">No Analysis Yet</p>
                      <p className="text-sm text-white text-center max-w-xs">
                        {isAnalyzing
                          ? "Processing your image..."
                          : "Upload a leaf image and click analyze to get results."}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>


      {/* FLOATING REPORT MODAL */}
      <AnimatePresence>
        {showReportModal && selectedReport && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReportModal(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <Card className="max-w-4xl max-h-[90vh] overflow-hidden w-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
                <CardHeader className="border-b sticky top-0  z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl text-white">
                        {/* <History className="w-5 h-5 text-primary" /> */}
                        Report Details
                      </CardTitle>
                      <CardDescription className={"text-white"}>
                        Analysis from {selectedReport.formattedDate}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReportModal(false)}
                      className="h-8 w-8 p-0 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20 "
                    >
                      <X className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </CardHeader>

                <div className="overflow-y-auto scrollbar-none text-white max-h-[calc(90vh-120px)]">
                  <CardContent className="p-6 space-y-6">
                    {/* Report Header */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">

                            <Badge variant={
                              selectedReport.severity === 'low' ? 'success' :
                                selectedReport.severity === 'medium' ? 'warning' : 'danger'
                            } className="text-lg">
                              {selectedReport.disease_name}
                            </Badge>

                            {selectedReport.crop_type && (
                              <Badge variant="outline" className={" bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20 text-white"}>
                                <Sprout className="w-3 h-3 mr-1 text-white" />
                                {selectedReport.crop_type}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2 text-white">Description</h4>
                          <p className="text-sm">{selectedReport.description}</p>
                        </div>

                        {/* Confidence Score */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium ">Confidence Score</span>
                            <span className="text-sm font-bold text-white">
                              {selectedReport.confidencePercentage}%
                            </span>
                          </div>
                          <Progress value={selectedReport.confidencePercentage} className="h-2 [&>*]:bg-white" />
                        </div>
                      </div>

                      {/* Image Preview */}
                      {selectedReport.image_url && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Analyzed Image</h4>
                          <div className="border rounded-lg overflow-hidden">
                            <img
                              src={selectedReport.image_url}
                              alt="Analyzed leaf"
                              className="w-full h-48 object-contain bg-muted/30"
                              onError={(e) => {
                                console.error("Failed to load report image:", selectedReport.image_url);
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-full h-48 flex items-center justify-center text-muted-foreground">Image not available</div>';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Symptoms */}
                    {selectedReport.symptoms && selectedReport.symptoms.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2 ">
                          {/* <AlertTriangle className="w-4 h-4 text-amber-500" /> */}
                          Symptoms Identified
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedReport.symptoms.map((symptom, index) => (
                            <div key={index} className="text-sm p-3  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-white hover:bg-white/20 rounded-lg flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-white hover:bg-white/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium">{index + 1}</span>
                              </div>
                              <span>{symptom}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prevention & Cause */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedReport.prevention && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            {/* <Shield className="w-4 h-4 text-blue-500" /> */}
                            Prevention
                          </h4>
                          <p className="text-sm p-3  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-white hover:bg-white/20 rounded-lg">{selectedReport.prevention}</p>
                        </div>
                      )}

                      {selectedReport.cause && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            {/* <AlertCircle className="w-4 h-4 text-red-500" /> */}
                            Cause
                          </h4>
                          <p className="text-sm p-3  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-white hover:bg-white/20 rounded-lg">{selectedReport.cause}</p>
                        </div>
                      )}
                    </div>

                    {/* Treatments */}
                    {selectedReport.treatments && selectedReport.treatments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          {/* <Pill className="w-4 h-4 text-primary" /> */}
                          Recommended Treatments
                        </h4>
                        <div className="space-y-2">
                          {selectedReport.treatments.map((treatment, index) => (
                            <div key={index} className="text-sm p-3  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-lg flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium">{index + 1}</span>
                              </div>
                              <span>{treatment}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Products */}
                    {selectedReport.recommendedProducts && selectedReport.recommendedProducts.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          {/* <ShoppingCart className="w-4 h-4 text-green-500" /> */}
                          Recommended Products
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedReport.recommendedProducts.map((product, index) => (
                            <div key={index} className="text-sm p-3  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-white hover:bg-white/20 rounded-lg">
                              <div className="font-medium mb-2">{product.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Notes */}
                    {selectedReport.additional_notes && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          {/* <Info className="w-4 h-4 text-purple-500" /> */}
                          Additional Information
                        </h4>
                        <p className="text-sm p-3  bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-white hover:bg-white/20 rounded-lg">{selectedReport.additional_notes}</p>
                      </div>
                    )}

                    {/* Additional Report Info */}
                    <div className=" pt-4 border-t">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Actions</h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteReport(selectedReport.id)}
                            className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4 mr-2 text-white" />
                            Delete Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}