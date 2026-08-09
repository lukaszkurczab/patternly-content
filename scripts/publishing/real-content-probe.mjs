import { inspectTrack, PublishingFailure } from "./pipeline.mjs";

try {
  await inspectTrack({ trackId: "coding-interview-dsa-problem-solving" });
  console.log("REAL_CONTENT_STATUS=READY_FOR_EVIDENCE");
} catch (error) {
  if (error instanceof PublishingFailure && error.code === "EMPTY_INGRESS") {
    console.log("REAL_CONTENT_STATUS=EMPTY_INGRESS");
  } else {
    throw error;
  }
}
