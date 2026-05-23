import { authInitialState } from "./slices/authSlice";
import { uiInitialState } from "./slices/uiSlice";
import { schoolInitialState } from "./slices/schoolSlice";

// Placeholder store shape so future Redux Toolkit wiring has a single source of truth.
export function getStoreBlueprint() {
  return {
    auth: authInitialState,
    ui: uiInitialState,
    school: schoolInitialState,
  };
}
