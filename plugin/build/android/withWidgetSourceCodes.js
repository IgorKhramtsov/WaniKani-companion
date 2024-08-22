"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withWidgetSourceCodes = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const config_plugins_1 = require("@expo/config-plugins");
const fs = __importStar(require("fs-extra"));
const glob = __importStar(require("glob"));
const path = __importStar(require("path"));
const withWidgetSourceCodes = config => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        'android',
        async (newConfig) => {
            const projectRoot = newConfig.modRequest.projectRoot;
            const platformRoot = newConfig.modRequest.platformProjectRoot;
            const widgetDir = path.join(projectRoot, 'widget');
            copyResourceFiles(widgetDir, platformRoot);
            const packageName = config.android?.package;
            prepareSourceCodes(widgetDir, platformRoot, packageName);
            return newConfig;
        },
    ]);
};
exports.withWidgetSourceCodes = withWidgetSourceCodes;
function copyResourceFiles(widgetSourceDir, platformRoot) {
    const source = path.join(widgetSourceDir, 'android', 'src', 'main', 'res');
    const resDest = path.join(platformRoot, 'app', 'src', 'main', 'res');
    console.log(`copy the res files from ${source} to ${resDest}`);
    fs.copySync(source, resDest);
}
async function prepareSourceCodes(widgetSourceDir, platformRoot, packageName) {
    const packageDirPath = packageName.replace(/\./g, '/');
    const source = path.join(widgetSourceDir, `android/src/main/java/package_name`);
    const dest = path.join(platformRoot, 'app/src/main/java', packageDirPath);
    console.log(`copy the kotlin codes from ${source} to ${dest}`);
    fs.copySync(source, dest);
    const files = glob.sync(`${dest}/*.kt`);
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const newContent = content.replace(/^package .*\s/, `package ${packageName}\n`);
        fs.writeFileSync(file, newContent);
    }
}
