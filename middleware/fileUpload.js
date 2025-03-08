const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const handleFileUploadError = (err, res) => {
  if (err instanceof multer.MulterError) {
    console.log(err);
    if (err.code === "LIMIT_FILE_SIZE") {
      
      return res.status(400).json({
        message: "Dosya boyutu çok büyük. Lütfen daha küçük bir fotoğraf seçin (maksimum 10MB)."
      });
    }
    return res.status(400).json({ 
      message: "Dosya yükleme hatası: " + err.message 
    });
  }
  
  return res.status(500).json({ 
    message: "Beklenmeyen bir hata oluştu: " + err.message 
  });
};

const fileUploadMiddleware = (req, res, next) => {
  
  upload.single("image")(req, res, (err) => {
    if (err) {
      return handleFileUploadError(err, res);
    }
    next();
  });
};

module.exports = fileUploadMiddleware;
