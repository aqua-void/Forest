from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import sys
import os
import re
from pathlib import Path
import requests
import tempfile
import json
from fastapi import HTTPException
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path=Path(__file__).parent / ".env")


# Add ML directory to path so we can import forest
# Since we're in backend/, ML is at backend/ML
sys.path.insert(0, str(Path(__file__).parent / "ML"))

from groq import Groq
from forest import predict

# Request model for URL
class ImageURL(BaseModel):
    url: str

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Forest Disease Detection API", "version": "1.0"}


@app.post("/getDisease")
async def get_disease_from_url(image_data: ImageURL):
    """
    Get disease prediction from an image URL and detailed disease info
    Flow:
    1. Download image from URL
    2. Send to model for prediction
    3. Get detailed disease info from AI
    Accepts JSON body with 'url' field: {"url": "https://example.com/image.jpg"}
    Returns JSON with crop, disease, confidence, and detailed disease info
    """
    tmp_path = None
    try:
        # Validate URL format
        if not image_data.url.startswith(("http://", "https://")):
            raise ValueError("Invalid URL: must start with http:// or https://")
        
        # Download image from URL
        response = requests.get(image_data.url, timeout=10)
        response.raise_for_status()
        
        # Validate content type
        content_type = response.headers.get("content-type", "")
        if not content_type.startswith("image/"):
            raise ValueError(f"Invalid content type: {content_type}. Expected image/*")
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
            tmp_file.write(response.content)
            tmp_path = tmp_file.name
        
        # Step 1: Make prediction
        crop, disease, confidence = predict(tmp_path)
        
        # Step 2: Get detailed disease info from AI
        disease_info = await get_disease_info_internal(disease)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "prediction": {
                    "crop": crop,
                    "disease": disease,
                    "confidence": round(confidence * 100, 2),
                    "message": f"Detected {disease} on {crop} with {confidence*100:.2f}% confidence"
                },
                "disease_info": disease_info
            }
        )
    except requests.RequestException as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": f"Failed to download image: {str(e)}"}
        )
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": str(e)}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Prediction failed: {str(e)}"}
        )
    finally:
        # Always clean up temp file if it was created
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass

# Initialize Groq client with API key from environment
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set in .env file")
groq_client = Groq(api_key=GROQ_API_KEY)


class DiseaseRequest(BaseModel):
    disease: str


# Helper function to get disease info from AI
async def get_disease_info_internal(disease_name: str):
    """Internal function to get disease info from AI"""
    prompt = f"""You are a helpful assistant that provides disease information.
Return ONLY a valid JSON object with this exact structure (no other text):
{{
  "disease":"{disease_name}",
  "info":"Brief description of the disease",
  "prevention":"Prevention methods",
  "cause":"What causes this disease",
  "recommendedProduct":[{{"name":"Product name","image":"image_url"}}],
  "symptoms":["symptom1","symptom2"],
  "treatment":"Treatment recommendations",
  "other":"Any other relevant information"
}}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )

        ai_output = response.choices[0].message.content.strip()
        
        # Extract JSON from the response
        json_match = re.search(r'\{.*\}', ai_output, re.DOTALL)
        
        if json_match:
            json_str = json_match.group(0)
        else:
            json_str = ai_output
        
        # Validate and parse JSON
        try:
            data = json.loads(json_str)
            return data
        except json.JSONDecodeError:
            # Return structured error if JSON parsing fails
            return {
                "success": False,
                "disease": disease_name,
                "error": "Invalid JSON from AI",
                "raw_output": ai_output[:300]
            }

    except Exception as e:
        return {
            "success": False,
            "disease": disease_name,
            "error": f"Failed to get disease info: {str(e)}"
        }


@app.post("/disease")
async def get_disease_info(request: DiseaseRequest):
    """
    Get detailed disease information from AI
    Accepts JSON body with 'disease' field: {"disease": "Cedar Apple Rust"}
    Returns detailed disease information
    """
    if not request.disease.strip():
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "Disease name cannot be empty"}
        )
    
    disease_info = await get_disease_info_internal(request.disease)
    return JSONResponse(
        status_code=200,
        content={"success": True, "data": disease_info}
    )

