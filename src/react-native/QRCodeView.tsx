import React, { useMemo } from "react";
import { WebView } from "react-native-webview";
import { Options } from "../types";
import QRCodeStyling from "../core/QRCodeStyling";
import builtPackage from "../../dist/qr-code-styling.js";
interface QRCodeViewProps {
  options: Partial<Options>;
}

const QRCodeView: React.FC<QRCodeViewProps> = ({ options }: QRCodeViewProps) => {
  console.log(builtPackage);
  const html = useMemo(
    () =>
      `<html>
      <head><script type="text/javascript">${builtPackage}</script></head>
      <body>
      <div id="canvas"></div>
      <script type="text/javascript">
        var qrCode = ${new QRCodeStyling(options)};
        qrCode.append(document.getElementById("canvas"));
        qrCode.update();
      </script>
      </body>
      </html>`,
    [options]
  );
  return (
    <WebView
      javaScriptEnabled={true}
      originWhitelist={["*"]}
      javaScriptEnabledAndroid={true}
      source={{
        html: html
      }}
    />
  );
};

export default QRCodeView;
