import React, { useRef } from "react"

export default function OtpInput({ value, onChange, length = 6, className = "" }) {
  const inputsRef = useRef([])

  // Writes digits into the boxes starting at `start`, then focuses the box
  // after the last one filled. Used for typing, pasting and SMS autofill.
  const fillFrom = (start, digits) => {
    if (!digits) return
    const chars = value.padEnd(length, " ").split("").slice(0, length)
    digits
      .slice(0, length - start)
      .split("")
      .forEach((digit, i) => {
        chars[start + i] = digit
      })
    onChange(chars.join("").trimEnd())
    const next = Math.min(start + digits.length, length - 1)
    inputsRef.current[next]?.focus()
  }

  const handleChange = (e, idx) => {
    const digits = e.target.value.replace(/[^0-9]/g, "")
    if (!digits) {
      // Box cleared
      const chars = value.padEnd(length, " ").split("")
      chars[idx] = " "
      onChange(chars.join("").trimEnd())
      return
    }
    // One new digit typed over an existing one keeps only the new digit;
    // several at once (autofill) spread across the boxes
    if (digits.length === 2 && value[idx]) {
      fillFrom(idx, digits.replace(value[idx], "") || digits[1])
    } else {
      fillFrom(idx, digits)
    }
  }

  const handlePaste = (e, idx) => {
    e.preventDefault()
    // Pasting the whole code into any box fills from the first one
    const digits = e.clipboardData.getData("text").replace(/[^0-9]/g, "")
    fillFrom(digits.length >= length ? 0 : idx, digits)
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !value[idx]?.trim() && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  return (
    <div className={`flex justify-center gap-2 sm:gap-3 md:gap-6 ${className}`}>
      {[...Array(length)].map((_, i) => (
        <input
          key={i}
          ref={el => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1} of ${length}`}
          value={value[i]?.trim() || ""}
          onChange={e => handleChange(e, i)}
          onPaste={e => handlePaste(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onFocus={e => e.target.select()}
          className="h-12 w-10 rounded-lg border-2 border-grey-100 text-center text-lg focus:border-primary focus:outline-none sm:w-12"
        />
      ))}
    </div>
  )
}
