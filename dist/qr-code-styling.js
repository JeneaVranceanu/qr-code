(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["QRCodeStyling"] = factory();
	else
		root["QRCodeStyling"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("import QRCodeStyling from \"./core/QRCodeStyling\";\nimport dotTypes from \"./constants/dotTypes\";\nimport cornerDotTypes from \"./constants/cornerDotTypes\";\nimport cornerSquareTypes from \"./constants/cornerSquareTypes\";\nimport errorCorrectionLevels from \"./constants/errorCorrectionLevels\";\nimport errorCorrectionPercents from \"./constants/errorCorrectionPercents\";\nimport modes from \"./constants/modes\";\nimport qrTypes from \"./constants/qrTypes\";\nimport drawTypes from \"./constants/drawTypes\";\nimport shapeTypes from \"./constants/shapeTypes\";\nimport gradientTypes from \"./constants/gradientTypes\";\nimport QRCodeView from \"./react-native/QRCodeView\";\n\nexport * from \"./types\";\n\nexport {\n  dotTypes,\n  cornerDotTypes,\n  cornerSquareTypes,\n  errorCorrectionLevels,\n  errorCorrectionPercents,\n  modes,\n  qrTypes,\n  drawTypes,\n  shapeTypes,\n  gradientTypes,\n  QRCodeView\n};\n\nexport default QRCodeStyling;\n");

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXItY29kZS1zdHlsaW5nLmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPOztVQ1ZBO1VBQ0E7Ozs7O1dDREE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7OztBQ05BLGlFQUFlLDA3QkFBMDdCLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nL3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJRUkNvZGVTdHlsaW5nXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIlFSQ29kZVN0eWxpbmdcIl0gPSBmYWN0b3J5KCk7XG59KShzZWxmLCAoKSA9PiB7XG5yZXR1cm4gIiwiLy8gVGhlIHJlcXVpcmUgc2NvcGVcbnZhciBfX3dlYnBhY2tfcmVxdWlyZV9fID0ge307XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJleHBvcnQgZGVmYXVsdCBcImltcG9ydCBRUkNvZGVTdHlsaW5nIGZyb20gXFxcIi4vY29yZS9RUkNvZGVTdHlsaW5nXFxcIjtcXG5pbXBvcnQgZG90VHlwZXMgZnJvbSBcXFwiLi9jb25zdGFudHMvZG90VHlwZXNcXFwiO1xcbmltcG9ydCBjb3JuZXJEb3RUeXBlcyBmcm9tIFxcXCIuL2NvbnN0YW50cy9jb3JuZXJEb3RUeXBlc1xcXCI7XFxuaW1wb3J0IGNvcm5lclNxdWFyZVR5cGVzIGZyb20gXFxcIi4vY29uc3RhbnRzL2Nvcm5lclNxdWFyZVR5cGVzXFxcIjtcXG5pbXBvcnQgZXJyb3JDb3JyZWN0aW9uTGV2ZWxzIGZyb20gXFxcIi4vY29uc3RhbnRzL2Vycm9yQ29ycmVjdGlvbkxldmVsc1xcXCI7XFxuaW1wb3J0IGVycm9yQ29ycmVjdGlvblBlcmNlbnRzIGZyb20gXFxcIi4vY29uc3RhbnRzL2Vycm9yQ29ycmVjdGlvblBlcmNlbnRzXFxcIjtcXG5pbXBvcnQgbW9kZXMgZnJvbSBcXFwiLi9jb25zdGFudHMvbW9kZXNcXFwiO1xcbmltcG9ydCBxclR5cGVzIGZyb20gXFxcIi4vY29uc3RhbnRzL3FyVHlwZXNcXFwiO1xcbmltcG9ydCBkcmF3VHlwZXMgZnJvbSBcXFwiLi9jb25zdGFudHMvZHJhd1R5cGVzXFxcIjtcXG5pbXBvcnQgc2hhcGVUeXBlcyBmcm9tIFxcXCIuL2NvbnN0YW50cy9zaGFwZVR5cGVzXFxcIjtcXG5pbXBvcnQgZ3JhZGllbnRUeXBlcyBmcm9tIFxcXCIuL2NvbnN0YW50cy9ncmFkaWVudFR5cGVzXFxcIjtcXG5pbXBvcnQgUVJDb2RlVmlldyBmcm9tIFxcXCIuL3JlYWN0LW5hdGl2ZS9RUkNvZGVWaWV3XFxcIjtcXG5cXG5leHBvcnQgKiBmcm9tIFxcXCIuL3R5cGVzXFxcIjtcXG5cXG5leHBvcnQge1xcbiAgZG90VHlwZXMsXFxuICBjb3JuZXJEb3RUeXBlcyxcXG4gIGNvcm5lclNxdWFyZVR5cGVzLFxcbiAgZXJyb3JDb3JyZWN0aW9uTGV2ZWxzLFxcbiAgZXJyb3JDb3JyZWN0aW9uUGVyY2VudHMsXFxuICBtb2RlcyxcXG4gIHFyVHlwZXMsXFxuICBkcmF3VHlwZXMsXFxuICBzaGFwZVR5cGVzLFxcbiAgZ3JhZGllbnRUeXBlcyxcXG4gIFFSQ29kZVZpZXdcXG59O1xcblxcbmV4cG9ydCBkZWZhdWx0IFFSQ29kZVN0eWxpbmc7XFxuXCI7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9