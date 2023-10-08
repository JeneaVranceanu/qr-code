import React, { useMemo } from "react";
import { WebView } from "react-native-webview";
import { Options } from "../types";
import QRCodeStyling from "../core/QRCodeStyling";

interface QRCodeViewProps {
  options: Partial<Options>;
}

const QRCodeView: React.FC<QRCodeViewProps> = ({ options }: QRCodeViewProps) => {
  const html = useMemo(
    () =>
      `<html>
      <head>
        <script type="text/javascript">${QRCodeStyling}</script>
      </head>
      <body>
      <div id="canvas"></div>
      <script type="text/javascript">
      new QRCodeStyling(${options}).append(document.getElementById("canvas"));
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
