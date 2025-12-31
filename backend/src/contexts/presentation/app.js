/**
 * Presentation Context Application
 *
 * Port 3003 - Public search interface for ethnobotanical data
 * Allows public users to search and browse approved references
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('../../shared/config');
const logger = require('../../shared/logger');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Resolve static file paths - works in both dev and production
const rootDir = path.resolve(__dirname, '../../../..');
const stylesDir = path.join(rootDir, 'frontend/dist/styles');
const presentationStylesDir = path.join(rootDir, 'frontend/src/presentation/styles');
const imagesDir = path.join(rootDir, 'backend/src/shared/public/images');
const scriptsDir = path.join(rootDir, 'frontend/src/presentation/scripts');

// Log paths for debugging
logger.presentation(`Root directory: ${rootDir}`);
logger.presentation(`Styles directory: ${stylesDir}`);
logger.presentation(`Presentation styles directory: ${presentationStylesDir}`);
logger.presentation(`Scripts directory: ${scriptsDir}`);

// Static files with fallback logging
app.use('/styles', (req, res, next) => {
  logger.presentation(`Static request: /styles${req.path}`);
  next();
}, express.static(stylesDir));

app.use('/styles/presentation', (req, res, next) => {
  logger.presentation(`Static request: /styles/presentation${req.path}`);
  next();
}, express.static(presentationStylesDir));

app.use('/images', (req, res, next) => {
  logger.presentation(`Static request: /images${req.path}`);
  next();
}, express.static(imagesDir));

app.use('/scripts', (req, res, next) => {
  logger.presentation(`Static request: /scripts${req.path}`);
  next();
}, express.static(scriptsDir));

// Request logging
app.use((req, res, next) => {
  logger.presentation(`${req.method} ${req.path}`);
  next();
});

// Debug endpoint - shows current configuration
app.get('/__debug/paths', (req, res) => {
  res.json({
    rootDir,
    stylesDir,
    presentationStylesDir,
    scriptsDir,
    imagesDir,
    dirExists: {
      styles: fs.existsSync(stylesDir),
      presentationStyles: fs.existsSync(presentationStylesDir),
      scripts: fs.existsSync(scriptsDir),
      images: fs.existsSync(imagesDir)
    },
    files: {
      presentationStyles: fs.existsSync(presentationStylesDir) ? fs.readdirSync(presentationStylesDir) : [],
      scripts: fs.existsSync(scriptsDir) ? fs.readdirSync(scriptsDir) : []
    }
  });
});

// Import routes
const routes = require('./routes');
app.use('/', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Página não encontrada',
    error: {}
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Presentation context error:', err.message);

  res.status(err.status || 500);
  res.render('error', {
    message: err.message || 'Ocorreu um erro no servidor',
    error: config.isDevelopment ? err : {}
  });
});

module.exports = app;
