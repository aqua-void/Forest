// services/mockBackend.js

// The type definitions are removed in plain JS, 
// but we include comments for clarity of the expected structure.

/**
 * @typedef {object} MockDisease
 * @property {string} name
 * @property {'low' | 'medium' | 'high'} severity
 * @property {number} confidence
 * @property {string} description
 * @property {string[]} treatments
 * @property {string} estimatedCost
 */

/**
 * @typedef {object} MockUploadResult
 * @property {string} path
 * @property {string} url
 * @property {string} fileName
 * @property {string} timestamp
 * @property {boolean} isMock
 */

/**
 * @typedef {object} MockReportResult
 * @property {string} disease
 * @property {number} confidence
 * @property {string} severity
 * @property {string} image_url
 * @property {{x: number, y: number, w: number, h: number}} bbox
 * @property {string[]} treatments
 * @property {string} estimated_cost
 * @property {number} processing_time
 * @property {string} report_id
 * @property {string} type
 */

/**
 * @typedef {'idle' | 'starting' | 'uploading' | 'upload_completed' | 'notifying_backend' | 'queued' | 'waiting_for_analysis' | 'completed' | 'error'} MockStage
 */

/**
 * @typedef {object} MockStageInfo
 * @property {string} icon
 * @property {string} text
 * @property {string} color
 */


export class MockBackendService {
    // Mock diseases database
    static diseases = [
        {
            name: "Early Blight",
            severity: "medium",
            confidence: 0.87,
            description: "Fungal disease affecting leaves with concentric rings",
            treatments: ["Apply fungicide every 7-10 days", "Remove infected leaves", "Improve air circulation"],
            estimatedCost: "$20-50"
        },
        {
            name: "Leaf Spot",
            severity: "low",
            confidence: 0.76,
            description: "Bacterial infection causing small, dark spots",
            treatments: ["Use copper-based bactericides", "Avoid overhead watering", "Practice crop rotation"],
            estimatedCost: "$15-40"
        },
        {
            name: "Bacterial Spot",
            severity: "high",
            confidence: 0.92,
            description: "Water-soaked lesions that turn brown",
            treatments: ["Apply streptomycin spray", "Use resistant varieties", "Sanitize tools"],
            estimatedCost: "$25-60"
        },
        {
            name: "Healthy",
            severity: "low",
            confidence: 0.95,
            description: "No signs of disease detected",
            treatments: ["Continue regular maintenance", "Monitor for early signs"],
            estimatedCost: "$0"
        },
        {
            name: "Late Blight",
            severity: "high",
            confidence: 0.89,
            description: "Destructive disease affecting potatoes and tomatoes",
            treatments: ["Apply systemic fungicides", "Destroy infected plants", "Use resistant cultivars"],
            estimatedCost: "$50-100"
        },
        {
            name: "Powdery Mildew",
            severity: "medium",
            confidence: 0.81,
            description: "White powdery growth on leaf surfaces",
            treatments: ["Apply sulfur-based fungicides", "Improve air flow", "Reduce humidity"],
            estimatedCost: "$30-70"
        },
    ];

    // Stage configurations
    static stages = {
        idle: { icon: "Camera", text: "Ready to upload", color: "text-gray-500" },
        starting: { icon: "Upload", text: "Starting analysis", color: "text-blue-500" },
        uploading: { icon: "Upload", text: "Uploading to cloud", color: "text-blue-500" },
        upload_completed: { icon: "Check", text: "Upload completed", color: "text-green-500" },
        notifying_backend: { icon: "Globe", text: "Notifying backend", color: "text-blue-500" },
        queued: { icon: "Clock", text: "Queued for analysis", color: "text-yellow-500" },
        waiting_for_analysis: { icon: "Loader2", text: "AI analyzing image", color: "text-purple-500" },
        completed: { icon: "CheckCircle2", text: "Analysis complete", color: "text-green-500" },
        error: { icon: "XCircle", text: "Analysis failed", color: "text-red-500" },
    };

    // Simulate delay
    static async simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate mock upload result
    static createMockUploadResult(file) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
        const url = URL.createObjectURL(file);

        return {
            path: `mock/upload/${fileName}`,
            url,
            fileName: file.name,
            timestamp: new Date().toISOString(),
            isMock: true
        };
    }

    // Generate mock report ID
    static generateReportId() {
        return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Generate mock analysis result
    static generateMockResult(imageUrl) {
        const randomDisease = this.diseases[Math.floor(Math.random() * this.diseases.length)];

        return {
            disease: randomDisease.name,
            confidence: randomDisease.confidence,
            severity: randomDisease.severity,
            image_url: imageUrl,
            bbox: {
                x: Math.floor(Math.random() * 100),
                y: Math.floor(Math.random() * 100),
                w: Math.floor(Math.random() * 200) + 100,
                h: Math.floor(Math.random() * 200) + 100,
            },
            treatments: randomDisease.treatments,
            estimated_cost: randomDisease.estimatedCost,
            processing_time: Math.floor(Math.random() * 5) + 2,
            report_id: this.generateReportId(),
            type: "report_result"
        };
    }

    // Get stage info
    static getStageInfo(stage) {
        return this.stages[stage] || this.stages.idle;
    }

    // Get stage progress value
    static getStageProgress(stage) {
        const progressMap = {
            idle: 0,
            starting: 10,
            uploading: 25,
            upload_completed: 50,
            notifying_backend: 60,
            queued: 75,
            waiting_for_analysis: 90,
            completed: 100,
            error: 0,
        };
        return progressMap[stage] || 0;
    }

    // Simulate WebSocket messages
    static simulateWebSocketMessages(
        reportId,
        onMessage,
        onComplete
    ) {
        let isCancelled = false;

        const sendMockMessages = async () => {
            if (isCancelled) return;

            // Simulate initial connection
            await this.simulateDelay(500);
            if (isCancelled) return;
            onMessage({ type: "connected", report_id: reportId });

            // Simulate queued status
            await this.simulateDelay(1000);
            if (isCancelled) return;
            onMessage({ type: "status_update", status: "queued", report_id: reportId });

            // Simulate analyzing status
            await this.simulateDelay(2000);
            if (isCancelled) return;
            onMessage({ type: "status_update", status: "analyzing", report_id: reportId });

            // Simulate completion
            await this.simulateDelay(3000);
            if (isCancelled) return;
            const result = this.generateMockResult("");
            onComplete(result);
        };

        sendMockMessages();

        // Return cleanup function
        return () => {
            isCancelled = true;
        };
    }

    // Mock backend API call
    static async mockNotifyBackend(imageInfo) {
        await this.simulateDelay(1500);

        return {
            report_id: this.generateReportId(),
            status: "queued",
            queue_position: Math.floor(Math.random() * 10) + 1,
            estimated_wait: Math.floor(Math.random() * 30) + 10,
            imageInfo
        };
    }

    // Format result for UI
    static formatResultForUI(data, imageUrl) {
        const diseaseInfo = this.diseases.find(d => d.name === data.disease) || this.diseases[0];

        return {
            disease: data.disease,
            confidence: Math.round(data.confidence * 100),
            severity: data.severity,
            description: diseaseInfo.description,
            treatments: data.treatments,
            estimatedCost: data.estimated_cost,
            imageUrl: data.image_url || imageUrl,
            bbox: data.bbox,
            processingTime: data.processing_time,
            rawData: data,
            isMock: true,
        };
    }
}