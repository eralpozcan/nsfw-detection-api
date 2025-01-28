# NSFW Detection API

[English](#english) | [Türkçe](#turkish)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Docker](https://img.shields.io/badge/docker-supported-blue.svg)

## English

REST API for detecting NSFW (Not Safe For Work) content in images using TensorFlow.js and NSFWJS.

### Features

- NSFW content detection
- High accuracy rate
- 5 different category classifications
- Easy to use
- RESTful API
- Docker support
- Multiple image format support (JPEG, PNG, WebP, AVIF)
- API Key authentication
- Automatic model caching

### Requirements

- Node.js >= 18.0.0
- Docker (optional)

### Installation

#### Using npm:
```bash
# Clone the repository
git clone https://github.com/eralpozcan/nsfw-detection-api.git

# Navigate to project directory
cd nsfw-detection-api

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Using Docker:
```bash
# Clone the repository
git clone https://github.com/eralpozcan/nsfw-detection-api.git

# Navigate to project directory
cd nsfw-detection-api

# Create environment file
cp .env.example .env

# Build and run with Docker Compose
docker-compose up --build
```

### Usage

To start the service:
```bash
npm start
```

### API Endpoints

#### 1. Health Check
```
GET /health
```

Example response:
```json
{
    "success": true,
    "data": {
        "status": "healthy",
        "modelStatus": "loaded",
        "supportedFormats": [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif"
        ],
        "timestamp": "2024-01-28T12:00:00.000Z"
    }
}
```

#### 2. NSFW Content Check
```
POST /check
```

Upload an image using multipart form data:
- `image`: Image file to analyze (max 10MB)

Example response:
```json
{
    "success": true,
    "data": {
        "analysis": {
            "isNSFW": false,
            "severity": "SAFE",
            "primaryClassification": {
                "category": "Neutral",
                "confidence": 0.98
            }
        },
        "details": [
            {
                "category": "Drawing",
                "confidence": 0.01,
                "isNSFWCategory": false
            },
            {
                "category": "Neutral",
                "confidence": 0.98,
                "isNSFWCategory": false
            }
        ],
        "metadata": {
            "filename": "test.jpg",
            "filesize": 12345,
            "originalFormat": "image/jpeg",
            "processedFormat": "image/png",
            "analyzedAt": "2024-01-28T12:00:00.000Z"
        }
    }
}
```

### Supported Categories

The NSFWJS model classifies images into these categories:
- Drawing: Normal drawings
- Hentai: Anime-style NSFW content
- Neutral: Safe content
- Porn: Adult content
- Sexy: Suggestive content

### Notes

- Model initialization might take some time on first start
- Processing time increases with image size
- Images with >0.5 probability in Porn, Hentai, or Sexy categories are marked as NSFW
- Result accuracy depends on image quality

### Security

- API Key authentication required for all endpoints
- Rate limiting implemented
- Input validation for all requests
- Secure error handling

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Turkish

TensorFlow.js ve NSFWJS kullanarak görüntülerde NSFW (Not Safe For Work) içerik tespiti yapan bir REST API.

### Özellikler

- NSFW içerik tespiti
- Yüksek doğruluk oranı
- 5 farklı kategori sınıflandırması
- Kolay kullanım
- RESTful API
- Docker desteği
- Çoklu görsel format desteği (JPEG, PNG, WebP, AVIF)
- API Key doğrulaması
- Otomatik model önbelleği

### Gereksinimler

- Node.js >= 18.0.0
- Docker (opsiyonel)

### Kurulum

#### npm ile:
```bash
# Repository'yi klonlayın
git clone https://github.com/eralpozcan/nsfw-detection-api.git

# Proje dizinine gidin
cd nsfw-detection-api

# Bağımlılıkları yükleyin
npm install

# Çevre değişkenleri dosyasını oluşturun
cp .env.example .env
```

#### Docker ile:
```bash
# Repository'yi klonlayın
git clone https://github.com/eralpozcan/nsfw-detection-api.git

# Proje dizinine gidin
cd nsfw-detection-api

# Çevre değişkenleri dosyasını oluşturun
cp .env.example .env

# Docker Compose ile build edip çalıştırın
docker compose up --build
```

### Kullanım

Servisi başlatmak için:
```bash
npm start
```

### API Endpointleri

#### 1. Sağlık Kontrolü
```
GET /health
```

Örnek yanıt:
```json
{
    "success": true,
    "data": {
        "status": "healthy",
        "modelStatus": "loaded",
        "supportedFormats": [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif"
        ],
        "timestamp": "2024-01-28T12:00:00.000Z"
    }
}
```

#### 2. NSFW İçerik Kontrolü
```
POST /check
```

Multipart form data ile görsel yükleyin:
- `image`: Analiz edilecek görsel dosyası (max 10MB)

Örnek yanıt:
```json
{
    "success": true,
    "data": {
        "analysis": {
            "isNSFW": false,
            "severity": "SAFE",
            "primaryClassification": {
                "category": "Neutral",
                "confidence": 0.98
            }
        },
        "details": [
            {
                "category": "Drawing",
                "confidence": 0.01,
                "isNSFWCategory": false
            },
            {
                "category": "Neutral",
                "confidence": 0.98,
                "isNSFWCategory": false
            }
        ],
        "metadata": {
            "filename": "test.jpg",
            "filesize": 12345,
            "originalFormat": "image/jpeg",
            "processedFormat": "image/png",
            "analyzedAt": "2024-01-28T12:00:00.000Z"
        }
    }
}
```

### Desteklenen Kategoriler

NSFWJS modeli aşağıdaki kategorilerde sınıflandırma yapar:
- Drawing: Normal çizimler
- Hentai: Anime tarzı NSFW içerik
- Neutral: Normal, güvenli içerik
- Porn: Yetişkin içerik
- Sexy: Müstehcen içerik

### Notlar

- Model ilk başlatmada biraz zaman alabilir
- Görsel boyutu arttıkça işlem süresi uzayabilir
- 0.5'ten yüksek olasılıkla Porn, Hentai veya Sexy kategorisine giren görseller NSFW olarak işaretlenir
- Sonuçların doğruluğu görselin kalitesine bağlıdır

### Güvenlik

- Tüm endpointler için API Key doğrulaması gerekli
- Rate limiting uygulandı
- Tüm istekler için girdi doğrulaması
- Güvenli hata yönetimi

### Katkıda Bulunma

Katkılarınızı bekliyoruz! Pull Request göndermekten çekinmeyin.

### Lisans

Bu proje MIT Lisansı ile lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın. 
