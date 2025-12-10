<<<<<<< HEAD
# from fastapi import FastAPI, File, UploadFile
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel
# import sys
# import os
# import re
# from pathlib import Path
# import requests
# import tempfile
# import json
# from fastapi import HTTPException
# from dotenv import load_dotenv

# # Load environment variables from .env file
# load_dotenv(dotenv_path=Path(__file__).parent / ".env")


# # Add ML directory to path so we can import forest
# # Since we're in backend/, ML is at backend/ML
# sys.path.insert(0, str(Path(__file__).parent / "ML"))

# from groq import Groq
# from forest import predict

# # Request model for URL
# class ImageURL(BaseModel):
#     url: str

# app = FastAPI()


# @app.get("/")
# async def root():
#     return {"message": "Forest Disease Detection API", "version": "1.0"}


# @app.post("/getDisease")
# async def get_disease_from_url(image_data: ImageURL):
#     """
#     Get disease prediction from an image URL and detailed disease info
#     Flow:
#     1. Download image from URL
#     2. Send to model for prediction
#     3. Get detailed disease info from AI
#     Accepts JSON body with 'url' field: {"url": "https://example.com/image.jpg"}
#     Returns JSON with crop, disease, confidence, and detailed disease info
#     """
#     tmp_path = None
#     try:
#         # Validate URL format
#         if not image_data.url.startswith(("http://", "https://")):
#             raise ValueError("Invalid URL: must start with http:// or https://")
        
#         # Download image from URL
#         response = requests.get(image_data.url, timeout=10)
#         response.raise_for_status()
        
#         # Validate content type
#         content_type = response.headers.get("content-type", "")
#         if not content_type.startswith("image/"):
#             raise ValueError(f"Invalid content type: {content_type}. Expected image/*")
        
#         # Save to temporary file
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
#             tmp_file.write(response.content)
#             tmp_path = tmp_file.name
        
#         # Step 1: Make prediction
#         crop, disease, confidence = predict(tmp_path)
        
#         # Step 2: Get detailed disease info from AI
#         disease_info = await get_disease_info_internal(disease)
        
#         return JSONResponse(
#             status_code=200,
#             content={
#                 "success": True,
#                 "prediction": {
#                     "crop": crop,
#                     "disease": disease,
#                     "confidence": round(confidence * 100, 2),
#                     "message": f"Detected {disease} on {crop} with {confidence*100:.2f}% confidence"
#                 },
#                 "disease_info": disease_info
#             }
#         )
#     except requests.RequestException as e:
#         return JSONResponse(
#             status_code=400,
#             content={"success": False, "error": f"Failed to download image: {str(e)}"}
#         )
#     except ValueError as e:
#         return JSONResponse(
#             status_code=400,
#             content={"success": False, "error": str(e)}
#         )
#     except Exception as e:
#         return JSONResponse(
#             status_code=500,
#             content={"success": False, "error": f"Prediction failed: {str(e)}"}
#         )
#     finally:
#         # Always clean up temp file if it was created
#         if tmp_path and os.path.exists(tmp_path):
#             try:
#                 os.remove(tmp_path)
#             except OSError:
#                 pass

# # Initialize Groq client with API key from environment
# GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# if not GROQ_API_KEY:
#     raise ValueError("GROQ_API_KEY environment variable not set in .env file")
# groq_client = Groq(api_key=GROQ_API_KEY)


# class DiseaseRequest(BaseModel):
#     disease: str


# # Helper function to get disease info from AI
# async def get_disease_info_internal(disease_name: str):
#     """Internal function to get disease info from AI"""
#     prompt = f"""You are a helpful assistant that provides disease information.
# Return ONLY a valid JSON object with this exact structure (no other text):
# {{
#   "disease":"{disease_name}",
#   "info":"Brief description of the disease",
#   "prevention":"Prevention methods",
#   "cause":"What causes this disease",
#   "recommendedProduct":[{{"name":"Product name","image":"image_url"}}],
#   "symptoms":["symptom1","symptom2"],
#   "treatment":"Treatment recommendations",
#   "other":"Any other relevant information"
# }}"""

#     try:
#         response = groq_client.chat.completions.create(
#             model="llama-3.3-70b-versatile",
#             messages=[{"role": "user", "content": prompt}]
#         )

#         ai_output = response.choices[0].message.content.strip()
        
#         # Extract JSON from the response
#         json_match = re.search(r'\{.*\}', ai_output, re.DOTALL)
        
#         if json_match:
#             json_str = json_match.group(0)
#         else:
#             json_str = ai_output
        
#         # Validate and parse JSON
#         try:
#             data = json.loads(json_str)
#             return data
#         except json.JSONDecodeError:
#             # Return structured error if JSON parsing fails
#             return {
#                 "success": False,
#                 "disease": disease_name,
#                 "error": "Invalid JSON from AI",
#                 "raw_output": ai_output[:300]
#             }

#     except Exception as e:
#         return {
#             "success": False,
#             "disease": disease_name,
#             "error": f"Failed to get disease info: {str(e)}"
#         }


# @app.post("/disease")
# async def get_disease_info(request: DiseaseRequest):
#     """
#     Get detailed disease information from AI
#     Accepts JSON body with 'disease' field: {"disease": "Cedar Apple Rust"}
#     Returns detailed disease information
#     """
#     if not request.disease.strip():
#         return JSONResponse(
#             status_code=400,
#             content={"success": False, "error": "Disease name cannot be empty"}
#         )
    
#     disease_info = await get_disease_info_internal(request.disease)
#     return JSONResponse(
#         status_code=200,
#         content={"success": True, "data": disease_info}
#     )

from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
=======
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
>>>>>>> 3b786080a8712de78dbd9dc393d35353bfd80163
from pydantic import BaseModel
import sys
import os
import re
from pathlib import Path
import requests
import tempfile
import json
<<<<<<< HEAD
import uuid
import asyncio
from datetime import datetime
import logging
from typing import Dict, List, Optional
from dotenv import load_dotenv
import aiohttp

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

# Add ML directory to path - use absolute path
ML_PATH = str(Path(__file__).parent.parent / "ML")
if ML_PATH not in sys.path:
    sys.path.insert(0, ML_PATH)

# Debug: verify the path exists
if not Path(ML_PATH).exists():
    raise ValueError(f"ML path does not exist: {ML_PATH}")

from groq import Groq
try:
    from forest import predict
except ImportError as e:
    raise ImportError(f"Failed to import forest from {ML_PATH}: {e}")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set")
groq_client = Groq(api_key=GROQ_API_KEY)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.report_connections: Dict[str, List[str]] = {}  # report_id -> list of client_ids

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        # Remove from report connections
        for report_id, clients in self.report_connections.items():
            if client_id in clients:
                clients.remove(client_id)
                if not clients:
                    del self.report_connections[report_id]
        logger.info(f"Client {client_id} disconnected")

    async def send_personal_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {e}")

    def register_report_client(self, report_id: str, client_id: str):
        if report_id not in self.report_connections:
            self.report_connections[report_id] = []
        if client_id not in self.report_connections[report_id]:
            self.report_connections[report_id].append(client_id)
        logger.info(f"Client {client_id} registered for report {report_id}")

    async def broadcast_to_report_clients(self, report_id: str, message: dict):
        if report_id in self.report_connections:
            for client_id in self.report_connections[report_id].copy():
                await self.send_personal_message(message, client_id)

# Models
class ImageURL(BaseModel):
    url: str

class AnalyzeImageRequest(BaseModel):
    user_id: str
    farm_id: Optional[str] = "default_farm"
    image_path: str
    image_url: str
    metadata: Optional[dict] = {}

class DiseaseRequest(BaseModel):
    disease: str

# Initialize FastAPI app
app = FastAPI(title="Forest Disease Detection API", version="2.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize connection manager
manager = ConnectionManager()

# In-memory storage for reports (in production, use a database)
reports_db = {}

# Helper function to generate report ID
def generate_report_id():
    return str(uuid.uuid4())

# Download image from URL
async def download_image_from_url(image_url: str) -> Optional[str]:
    """Download image from URL and save to temp file"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(image_url, timeout=10) as response:
                if response.status != 200:
                    logger.error(f"Failed to download image: HTTP {response.status}")
                    return None
                
                content_type = response.headers.get('content-type', '')
                if not content_type.startswith('image/'):
                    logger.error(f"Invalid content type: {content_type}")
                    return None
                
                # Create temp file
                with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
                    content = await response.read()
                    tmp_file.write(content)
                    return tmp_file.name
    except Exception as e:
        logger.error(f"Error downloading image: {e}")
        return None

# Process image analysis
async def process_image_analysis(report_id: str, image_url: str):
    """Background task to process image analysis"""
    try:
        # Update report status
        reports_db[report_id]["status"] = "processing"
        await manager.broadcast_to_report_clients(
            report_id,
            {"type": "status_update", "status": "processing", "report_id": report_id}
        )
        
        # Download image from Supabase URL
        logger.info(f"Downloading image from URL: {image_url}")
        tmp_path = await download_image_from_url(image_url)
        
        if not tmp_path:
            reports_db[report_id]["status"] = "failed"
            reports_db[report_id]["error"] = "Failed to download image"
            await manager.broadcast_to_report_clients(
                report_id,
                {
                    "type": "status_update", 
                    "status": "failed", 
                    "report_id": report_id,
                    "error": "Failed to download image"
                }
            )
            return
        
        try:
            # Make prediction
            logger.info(f"Making prediction for report {report_id}")
            crop, disease, confidence = predict(tmp_path)
            
            # Get disease info from AI
            disease_info = await get_disease_info_internal(disease)
            
            # Prepare result
            result = {
                "disease": disease,
                "crop": crop,
                "confidence": confidence,
                "severity": "medium",  # You can enhance this based on confidence
                "description": f"Detected {disease} on {crop} with {confidence*100:.2f}% confidence",
                "image_url": image_url,
                "disease_info": disease_info if isinstance(disease_info, dict) else {}
            }
            
            # Update report
            reports_db[report_id].update({
                "status": "completed",
                "result": result,
                "completed_at": datetime.now().isoformat(),
                "crop": crop,
                "disease": disease,
                "confidence": confidence
            })
            
            # Send result to clients
            await manager.broadcast_to_report_clients(
                report_id,
                {
                    "type": "report_result",
                    "report_id": report_id,
                    **result
                }
            )
            
            logger.info(f"Analysis completed for report {report_id}: {disease}")
            
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                
    except Exception as e:
        logger.error(f"Error processing report {report_id}: {e}")
        reports_db[report_id]["status"] = "failed"
        reports_db[report_id]["error"] = str(e)
        
        await manager.broadcast_to_report_clients(
            report_id,
            {
                "type": "status_update",
                "status": "failed",
                "report_id": report_id,
                "error": str(e)
            }
        )

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

# WebSocket endpoint
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("type") == "register_report":
                    report_id = message.get("report_id")
                    if report_id:
                        manager.register_report_client(report_id, client_id)
                        # Send current status if available
                        if report_id in reports_db:
                            await manager.send_personal_message(
                                {
                                    "type": "status_update",
                                    "status": reports_db[report_id]["status"],
                                    "report_id": report_id
                                },
                                client_id
                            )
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(client_id)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Forest Disease Detection API", "version": "2.0", "status": "running"}

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Analyze image endpoint (for frontend integration)
@app.post("/analyze-image")
async def analyze_image(request: AnalyzeImageRequest, background_tasks: BackgroundTasks):
    """
    Endpoint for frontend to submit images for analysis
    Expects Supabase image URL and path
    """
    try:
        # Generate report ID
        report_id = generate_report_id()
        
        # Create report entry
        reports_db[report_id] = {
            "id": report_id,
            "user_id": request.user_id,
            "farm_id": request.farm_id,
            "image_url": request.image_url,
            "image_path": request.image_path,
            "status": "queued",
            "created_at": datetime.now().isoformat(),
            "metadata": request.metadata
        }
        
        # Start background processing
        background_tasks.add_task(process_image_analysis, report_id, request.image_url)
        
        logger.info(f"Created report {report_id} for user {request.user_id}")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Analysis queued successfully",
                "report_id": report_id,
                "status": "queued"
            }
        )
        
    except Exception as e:
        logger.error(f"Error in analyze-image: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Failed to queue analysis: {str(e)}"
            }
        )

# Get report status
@app.get("/reports/{report_id}/status")
async def get_report_status(report_id: str):
    """Get the current status of a report"""
    if report_id not in reports_db:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": "Report not found"}
        )
    
    report = reports_db[report_id]
    response = {
        "success": True,
        "report_id": report_id,
        "status": report["status"],
        "created_at": report.get("created_at")
    }
    
    if report["status"] == "completed" and "result" in report:
        response["result"] = report["result"]
    
    if report["status"] == "failed" and "error" in report:
        response["error"] = report["error"]
    
    return JSONResponse(status_code=200, content=response)

# Get all reports for a user
@app.get("/users/{user_id}/reports")
async def get_user_reports(user_id: str):
    """Get all reports for a specific user"""
    user_reports = [
        report for report in reports_db.values() 
        if report["user_id"] == user_id
    ]
    
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "user_id": user_id,
            "reports": user_reports,
            "count": len(user_reports)
        }
    )

# Original getDisease endpoint (kept for compatibility)
@app.post("/getDisease")
async def get_disease_from_url(image_data: ImageURL):
    """
    Original endpoint for direct URL analysis
=======
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
>>>>>>> 3b786080a8712de78dbd9dc393d35353bfd80163
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

<<<<<<< HEAD
# Disease info endpoint
=======
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


>>>>>>> 3b786080a8712de78dbd9dc393d35353bfd80163
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

<<<<<<< HEAD
# List all active reports (admin only)
@app.get("/reports")
async def list_all_reports():
    """List all reports (for debugging/admin purposes)"""
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "reports": reports_db,
            "count": len(reports_db)
        }
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Forest Disease Detection API starting up...")
    logger.info(f"Using Groq API: {'Configured' if GROQ_API_KEY else 'Not configured'}")

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
=======
>>>>>>> 3b786080a8712de78dbd9dc393d35353bfd80163
