"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.post('/guardarUsuario', userController_1.guardarUsuario);
router.post('/generarMenu/:userId', userController_1.generarMenu);
exports.default = router;
