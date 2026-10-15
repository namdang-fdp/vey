"use client";
import { gooeyToast } from "goey-toast";

type NoticeOptions = { title?: string };
const headings = {
  success: "Success",
  error: "Unable to continue",
  info: "Information",
};

function show(
  type: "success" | "error" | "info",
  message: string,
  options: NoticeOptions = {},
) {
  const title = options.title ?? headings[type];
  // The latest action replaces previous feedback instead of covering the form with a stack.
  gooeyToast.dismiss();
  return gooeyToast[type](title, {
    description: message,
    spring: false,
    showTimestamp: false,
    showProgress: false,
    preset: "subtle",
    duration: type === "error" ? 6500 : 5000,
    timing: { displayDuration: type === "error" ? 6500 : 5000 },
    classNames: {
      wrapper: "vey-toast",
      title: "vey-toast-title",
    },
  });
}
export const toast = {
  error: (message: string, options?: NoticeOptions) =>
    show("error", message, options),
  success: (message: string, options?: NoticeOptions) =>
    show("success", message, options),
  info: (message: string, options?: NoticeOptions) =>
    show("info", message, options),
};
