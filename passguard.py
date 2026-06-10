from flask import Flask, render_template, request, jsonify
import re
import math

app = Flask(__name__)


def calculate_entropy(password):
    charset = 0
    if any(c.islower() for c in password):
        charset += 26
    if any(c.isupper() for c in password):
        charset += 26
    if any(c.isdigit() for c in password):
        charset += 10
    if any(not c.isalnum() for c in password):
        charset += 32
    if charset == 0:
        return 0
    return round(len(password) * math.log2(charset), 1)


def check_password_strength(password):
    length = len(password)
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(not c.isalnum() for c in password)
    has_no_spaces = " " not in password
    no_repeat = not re.search(r"(.)\1{2,}", password)
    no_common = password.lower() not in [
        "password", "123456", "password123", "qwerty",
        "letmein", "admin", "welcome", "monkey", "dragon"
    ]

    checks = {
        "length": {"pass": length >= 8, "label": "At least 8 characters", "tip": "Use 12+ characters for better security"},
        "length_strong": {"pass": length >= 12, "label": "12+ characters (recommended)", "tip": "Longer passwords are exponentially harder to crack"},
        "uppercase": {"pass": has_upper, "label": "Uppercase letter (A–Z)", "tip": "Mix in at least one capital letter"},
        "lowercase": {"pass": has_lower, "label": "Lowercase letter (a–z)", "tip": "Include lowercase letters"},
        "digit": {"pass": has_digit, "label": "At least one number (0–9)", "tip": "Add at least one digit"},
        "special": {"pass": has_special, "label": "Special character (!@#$…)", "tip": "Use symbols like !@#$%^&*"},
        "no_spaces": {"pass": has_no_spaces, "label": "No spaces", "tip": "Avoid spaces in passwords"},
        "no_repeat": {"pass": no_repeat, "label": "No repeating characters", "tip": "Avoid patterns like aaa or 111"},
        "no_common": {"pass": no_common, "label": "Not a common password", "tip": "Avoid obvious words like 'password'"},
    }

    # Score: weighted
    score = 0
    if checks["length"]["pass"]:
        score += 1
    if checks["length_strong"]["pass"]:
        score += 1
    if checks["uppercase"]["pass"] and checks["lowercase"]["pass"]:
        score += 1
    if checks["digit"]["pass"]:
        score += 1
    if checks["special"]["pass"]:
        score += 1
    if checks["no_repeat"]["pass"]:
        score += 0.5
    if checks["no_common"]["pass"]:
        score += 0.5

    # Normalize to 0–100
    score_pct = min(100, int((score / 6) * 100))

    if score_pct < 25:
        strength_label = "Very Weak"
        color = "#ff4444"
    elif score_pct < 50:
        strength_label = "Weak"
        color = "#ff8800"
    elif score_pct < 75:
        strength_label = "Moderate"
        color = "#ffcc00"
    elif score_pct < 90:
        strength_label = "Strong"
        color = "#88cc00"
    else:
        strength_label = "Very Strong"
        color = "#00cc66"

    entropy = calculate_entropy(password)
    crack_time = estimate_crack_time(entropy)

    return {
        "score": score_pct,
        "label": strength_label,
        "color": color,
        "entropy": entropy,
        "crack_time": crack_time,
        "checks": checks,
        "length": length,
    }


def estimate_crack_time(entropy):
    # Assume 10 billion guesses/sec (modern GPU)
    guesses_per_sec = 1e10
    combinations = 2 ** entropy
    seconds = combinations / guesses_per_sec

    if seconds < 1:
        return "Instantly"
    elif seconds < 60:
        return f"{int(seconds)} seconds"
    elif seconds < 3600:
        return f"{int(seconds/60)} minutes"
    elif seconds < 86400:
        return f"{int(seconds/3600)} hours"
    elif seconds < 31536000:
        return f"{int(seconds/86400)} days"
    elif seconds < 3.154e9:
        return f"{int(seconds/31536000)} years"
    elif seconds < 3.154e12:
        return f"{int(seconds/3.154e9)}K years"
    else:
        return "Centuries+"


@app.route("/")
def index():
    return render_template("passguard_ui.html")


@app.route("/check", methods=["POST"])
def check():
    data = request.get_json()
    password = data.get("password", "")
    if not password:
        return jsonify({"error": "No password provided"}), 400
    result = check_password_strength(password)
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
