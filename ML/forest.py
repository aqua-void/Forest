import torch
from torchvision import transforms, models
from PIL import Image
from pathlib import Path

# PATHS
MODEL_PATH = Path(__file__).parent / "forest_model.pth"

# Mapping: full classes → simplified crop + disease
CLASS_MAP = {
    'Apple___Apple_scab': ('Apple', 'Apple Scab'),
    'Apple___Black_rot': ('Apple', 'Black Rot'),
    'Apple___Cedar_apple_rust': ('Apple', 'Cedar Apple Rust'),
    'Apple___healthy': ('Apple', 'Healthy'),
    'Cherry_(including_sour)___healthy': ('Cherry', 'Healthy'),
    'Cherry_(including_sour)___Powdery_mildew': ('Cherry', 'Powdery Mildew'),
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': ('Corn', 'Gray Leaf Spot'),
    'Corn_(maize)___Common_rust_': ('Corn', 'Common Rust'),
    'Corn_(maize)___Northern_Leaf_Blight': ('Corn', 'Northern Leaf Blight'),
    'Corn_(maize)___healthy': ('Corn', 'Healthy'),
    'Grape___Black_rot': ('Grape', 'Black Rot'),
    'Grape___Esca_(Black_Measles)': ('Grape', 'Esca / Black Measles'),
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': ('Grape', 'Leaf Blight'),
    'Grape___healthy': ('Grape', 'Healthy'),
    'Peach___Bacterial_spot': ('Peach', 'Bacterial Spot'),
    'Peach___healthy': ('Peach', 'Healthy'),
    'Potato___Early_blight': ('Potato', 'Early Blight'),
    'Potato___Late_blight': ('Potato', 'Late Blight'),
    'Potato___healthy': ('Potato', 'Healthy'),
    'Tomato___Bacterial_spot': ('Tomato', 'Bacterial Spot'),
    'Tomato___Early_blight': ('Tomato', 'Early Blight'),
    'Tomato___Late_blight': ('Tomato', 'Late Blight'),
    'Tomato___Leaf_Mold': ('Tomato', 'Leaf Mold'),
    'Tomato___Septoria_leaf_spot': ('Tomato', 'Septoria Leaf Spot'),
    'Tomato___Spider_mites Two-spotted_spider_mite': ('Tomato', 'Spider Mites'),
    'Tomato___Target_Spot': ('Tomato', 'Target Spot'),
    'Tomato___Tomato_mosaic_virus': ('Tomato', 'Tomato Mosaic Virus'),
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': ('Tomato', 'Tomato Yellow Leaf Curl Virus'),
    'Tomato___healthy': ('Tomato', 'Healthy')
}

# Load model
classes = list(CLASS_MAP.keys())
model = models.mobilenet_v3_small(weights=None)
model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, len(classes))
model.load_state_dict(torch.load(str(MODEL_PATH), map_location="cpu"))
model.eval()

# Transforms
tf = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
])

# Predict function with confidence
def predict(img_path):
    img = Image.open(img_path).convert("RGB")
    img = tf(img).unsqueeze(0)
    
    with torch.no_grad():
        outputs = model(img)
        probs = torch.softmax(outputs, dim=1)
        conf, pred = torch.max(probs, 1)
    
    crop, disease = CLASS_MAP[classes[pred.item()]]
    return crop, disease, conf.item()