const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration du stockage pour les images d'invitations
const invitationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/images";

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + "-" + uniqueSuffix + ext;
    cb(null, name);
  },
});

// Configuration du stockage pour les avatars utilisateurs
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/avatars";

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const userId = req.user ? req.user.userId : "anonymous";
    const ext = path.extname(file.originalname);
    const name = `avatar-${userId}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

// Configuration du stockage pour les templates
const templateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/templates";

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = `template-preview-${uniqueSuffix}${ext}`;
    cb(null, name);
  },
});

// Filtre pour les types de fichiers autorisés
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Type de fichier non autorisé. Seuls JPEG, PNG et WebP sont acceptés."
      ),
      false
    );
  }
};

// Middleware pour upload d'images d'invitation
const uploadInvitationImage = multer({
  storage: invitationStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
}).single("invitation_image");

// Middleware pour upload d'avatar utilisateur
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1,
  },
}).single("avatar");

// Middleware pour upload de preview de template
const uploadTemplatePreview = multer({
  storage: templateStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
    files: 1,
  },
}).single("template_preview");

// Middleware pour upload multiple d'images
const uploadMultipleImages = multer({
  storage: invitationStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB par fichier
    files: 5, // Maximum 5 fichiers
  },
}).array("images", 5);

// Middleware pour gérer les erreurs d'upload
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "Fichier trop volumineux",
          code: "FILE_TOO_LARGE",
        });

      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Trop de fichiers",
          code: "TOO_MANY_FILES",
        });

      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Champ de fichier inattendu",
          code: "UNEXPECTED_FIELD",
        });

      default:
        return res.status(400).json({
          success: false,
          message: "Erreur d'upload: " + error.message,
          code: "UPLOAD_ERROR",
        });
    }
  }

  if (error.message.includes("Type de fichier")) {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: "INVALID_FILE_TYPE",
    });
  }

  next(error);
};

// Middleware pour valider et traiter les images uploadées
const processUploadedImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    // Ajouter des informations sur le fichier uploadé à la requête
    req.uploadedFile = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.destination.split("/")[1]}/${
        req.file.filename
      }`,
    };

    next();
  } catch (error) {
    console.error("Erreur lors du traitement de l'image:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du traitement de l'image",
    });
  }
};

// Middleware pour nettoyer les fichiers temporaires en cas d'erreur
const cleanupTempFiles = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    // Si la réponse indique une erreur et qu'un fichier a été uploadé
    if (req.file && res.statusCode >= 400) {
      try {
        fs.unlinkSync(req.file.path);
        console.log("Fichier temporaire supprimé:", req.file.filename);
      } catch (error) {
        console.error(
          "Erreur lors de la suppression du fichier temporaire:",
          error
        );
      }
    }

    originalSend.call(this, data);
  };

  next();
};

// Middleware pour redimensionner les images (nécessite sharp - optionnel)
const resizeImage = (maxWidth = 1200, maxHeight = 800, quality = 85) => {
  return async (req, res, next) => {
    try {
      if (!req.file || !req.file.mimetype.startsWith("image/")) {
        return next();
      }

      // Note: Pour utiliser cette fonctionnalité, installer sharp : npm install sharp
      try {
        const sharp = require("sharp");

        const resizedImagePath = req.file.path.replace(
          path.extname(req.file.path),
          "-resized" + path.extname(req.file.path)
        );

        await sharp(req.file.path)
          .resize(maxWidth, maxHeight, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality })
          .toFile(resizedImagePath);

        // Remplacer le fichier original par la version redimensionnée
        fs.unlinkSync(req.file.path);
        fs.renameSync(resizedImagePath, req.file.path);

        console.log("Image redimensionnée:", req.file.filename);
      } catch (sharpError) {
        console.log("Sharp non installé, redimensionnement ignoré");
      }

      next();
    } catch (error) {
      console.error("Erreur lors du redimensionnement:", error);
      next(); // Continuer même en cas d'erreur de redimensionnement
    }
  };
};

// Fonction utilitaire pour supprimer un fichier
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error) {
        console.error("Erreur lors de la suppression du fichier:", error);
        reject(error);
      } else {
        console.log("Fichier supprimé:", filePath);
        resolve();
      }
    });
  });
};

// Middleware pour gérer l'upload de fichiers CSV (pour import de données)
const uploadCSV = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = "uploads/temp";

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "import-" + uniqueSuffix + ".csv");
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers CSV sont autorisés"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
}).single("csv_file");

// Middleware pour créer les dossiers d'upload si nécessaires
const ensureUploadDirectories = (req, res, next) => {
  const directories = [
    "uploads/images",
    "uploads/avatars",
    "uploads/templates",
    "uploads/temp",
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log("Dossier créé:", dir);
    }
  });

  next();
};

// Middleware pour vérifier l'espace disque disponible
const checkDiskSpace = (req, res, next) => {
  try {
    const stats = fs.statSync("uploads");
    // Vérification basique - dans une vraie app, utiliser un package comme 'check-disk-space'
    next();
  } catch (error) {
    console.error("Erreur lors de la vérification de l'espace disque:", error);
    next(); // Continuer même en cas d'erreur
  }
};

// Configuration pour différents types d'upload avec validation personnalisée
const createUploadMiddleware = (options = {}) => {
  const {
    destination = "uploads/images",
    maxFileSize = 5 * 1024 * 1024,
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
    fieldName = "file",
    maxFiles = 1,
  } = options;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, fieldName + "-" + uniqueSuffix + ext);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(
            ", "
          )}`
        ),
        false
      );
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
    },
  });

  return maxFiles === 1
    ? upload.single(fieldName)
    : upload.array(fieldName, maxFiles);
};

module.exports = {
  uploadInvitationImage,
  uploadAvatar,
  uploadTemplatePreview,
  uploadMultipleImages,
  uploadCSV,
  handleUploadError,
  processUploadedImage,
  cleanupTempFiles,
  resizeImage,
  deleteFile,
  ensureUploadDirectories,
  checkDiskSpace,
  createUploadMiddleware,
};
