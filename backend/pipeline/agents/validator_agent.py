"""
Validator Agent — final quality gate before results are returned.
Checks synthetic quality, privacy thresholds, accuracy targets, and schema integrity.
"""

import asyncio
import time


class ValidatorAgent:
    name = "Validator"
    output: dict = {}

    # Thresholds
    MIN_PRIVACY_SCORE  = 80.0
    MIN_ACCURACY_DELTA = 5.0
    MAX_ATTACK_ACC     = 60.0
    MIN_SSIM           = 0.70
    MIN_SYNTHETIC_N    = 100

    async def run(self, ctx: dict):
        yield self._log("Running output quality gate checks...")
        await asyncio.sleep(0.2)

        checks = {
            "Synthetic sample count":          ctx.get("n_synthetic", 0) >= self.MIN_SYNTHETIC_N,
            "Synthetic fidelity (SSIM ≥ 0.70)":ctx.get("ssim_avg", 0)  >= self.MIN_SSIM,
            "Privacy score (≥ 80)":            ctx.get("privacy_score", 0) >= self.MIN_PRIVACY_SCORE,
            "Membership inference (< 60%)":    ctx.get("attack_acc", 100) <= self.MAX_ATTACK_ACC,
            "Accuracy delta (≥ 5%)":           ctx.get("delta_acc", 0)  >= self.MIN_ACCURACY_DELTA,
            "DPDP Act 2023 compliance":        ctx.get("dpdp_compliant", False),
            "Schema validation":               self._validate_schema(ctx),
            "Report generated":                bool(ctx.get("report")),
        }

        all_pass = True
        for label, passed in checks.items():
            mark = "✓" if passed else "✗"
            status = "PASS" if passed else "FAIL"
            if not passed:
                all_pass = False
            yield self._log(f"  {mark} {label}: {status}")
            await asyncio.sleep(0.1)

        if all_pass:
            yield self._log("═══ All checks PASSED ✓ — Results approved for delivery ═══")
        else:
            failed = [k for k, v in checks.items() if not v]
            yield self._log(f"⚠ {len(failed)} check(s) failed — flagging for human review")

        self.output = {
            "validation_passed": all_pass,
            "checks":            {k: ("PASS" if v else "FAIL") for k, v in checks.items()},
        }

    def _validate_schema(self, ctx: dict) -> bool:
        required_keys = ["synthetic_data", "privacy_score", "accuracy_baseline", "accuracy_augmented"]
        return all(k in ctx for k in required_keys)

    def _log(self, msg: str) -> dict:
        return {"type": "log", "agent": "val", "msg": f"[VALIDATOR] {msg}", "ts": time.time()}
