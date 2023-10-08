import * as index from "./index";
import React from "react";
import renderer from "react-test-renderer";
import { QRCodeView } from "./index";

jest.mock("react-native-webview", () => {
  return {
    WebView: () => null
  };
});

describe("Index", () => {
  it.each(["dotTypes", "errorCorrectionLevels", "errorCorrectionPercents", "modes", "qrTypes", "default"])(
    "The module should export certain submodules",
    (moduleName) => {
      expect(Object.keys(index)).toContain(moduleName);
    }
  );
});

test("renders correctly", () => {
  const options = {
    width: 500,
    height: 500,
    data: "eip155:0xcafecafecafecafecafecafecafecafecafecafe:2828",
    image: "https://2eff.lukso.dev/ipfs/QmS4Sb1bWC2xiDPfHvqV8urpzwjUQioqrzKRCXdmSNpDXA",
    dotsOptions: {
      type: "rounded",
      gradient: {
        type: "linear", //radial,
        rotation: Math.PI / 4,
        colorStops: [
          { offset: 0, color: "blue" },
          { offset: 0.5, color: "red" },
          { offset: 1, color: "green" }
        ]
      }
    },
    cornersSquareOptions: {
      type: "rounded",
      gradient: {
        type: "linear",
        rotation: Math.PI * 0.2,
        colorStops: [
          {
            offset: 0,
            color: "blue"
          },
          {
            offset: 1,
            color: "red"
          }
        ]
      }
    },
    imageOptions: {
      imageSize: 0.18,
      crossOrigin: "anonymous",
      shape: "circle",
      borderWidth: 7,
      borderColor: "#ffffff"
    }
  };
  const tree = renderer.create(<QRCodeView options={options} />).toJSON();
  expect(tree).toMatchSnapshot();
});
