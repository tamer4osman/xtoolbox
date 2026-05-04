export const toolConfig = {
  id: 'timestamp-converter',
  name: 'Timestamp Converter',
  category: 'encoding',
  description: 'Convert between Unix timestamps and human-readable dates.',
  icon: '⏰',
  status: 'done'
};

import { useState } from 'react'
import { showToast } from '../../utils/toast'

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [result, setResult] = useState(null)

  const handleTimestampToDate = () => {
    try {
      const ts = parseInt(timestamp)
      if (isNaN(ts)) {
        showToast('Please enter a valid timestamp', 'error')
        return
      }
      
      let date
      if (ts < 10000000000) {
        date = new Date(ts * 1000)
      } else {
        date = new Date(ts)
      }
      
      setResult({
        formatted: date.toLocaleString(),
        iso: date.toISOString(),
        utc: date.toUTCString(),
        relative: getRelativeTime(date)
      })
    } catch (err) {
      showToast('Invalid timestamp', 'error')
    }
  }

  const handleDateToTimestamp = () => {
    try {
      const date = new Date(dateInput)
      if (isNaN(date.getTime())) {
        showToast('Please enter a valid date', 'error')
        return
      }
      
      setResult({
        seconds: Math.floor(date.getTime() / 1000),
        milliseconds: date.getTime(),
        iso: date.toISOString(),
        utc: date.toUTCString()
      })
    } catch (err) {
      showToast('Invalid date', 'error')
    }
  }

  const getRelativeTime = (date) => {
    const now = new Date()
    const diff = now - date
    const abs = Math.abs(diff)
    
    const seconds = Math.floor(abs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)
    
    let unit, value
    if (years > 0) { unit = 'year'; value = years }
    else if (months > 0) { unit = 'month'; value = months }
    else if (days > 0) { unit = 'day'; value = days }
    else if (hours > 0) { unit = 'hour'; value = hours }
    else if (minutes > 0) { unit = 'minute'; value = minutes }
    else { unit = 'second'; value = seconds }
    
    const prefix = diff > 0 ? 'ago' : 'from now'
    return `${value} ${unit}${value > 1 ? 's' : ''} ${prefix}`
  }

  const now = () => {
    const now = new Date()
    setTimestamp(Math.floor(now.getTime() / 1000).toString())
    setDateInput(now.toISOString().slice(0, 16))
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">⏰ Timestamp Converter</h1>

      <div className="space-y-6">
        <div className="flex gap-2 mb-4">
          <button onClick={now} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            Now
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Timestamp → Date</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="Unix timestamp (e.g., 1704067200)"
              className="flex-1 p-3 border rounded-lg"
            />
            <button
              onClick={handleTimestampToDate}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Convert
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Date → Timestamp</h3>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="flex-1 p-3 border rounded-lg"
            />
            <button
              onClick={handleDateToTimestamp}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Convert
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2">
            {result.seconds !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Seconds:</span>
                <code className="bg-white px-2 py-1 rounded">{result.seconds}</code>
              </div>
            )}
            {result.milliseconds !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Milliseconds:</span>
                <code className="bg-white px-2 py-1 rounded">{result.milliseconds}</code>
              </div>
            )}
            {result.formatted && (
              <div className="flex justify-between">
                <span className="text-gray-600">Local:</span>
                <code className="bg-white px-2 py-1 rounded">{result.formatted}</code>
              </div>
            )}
            {result.iso && (
              <div className="flex justify-between">
                <span className="text-gray-600">ISO:</span>
                <code className="bg-white px-2 py-1 rounded text-sm">{result.iso}</code>
              </div>
            )}
            {result.utc && (
              <div className="flex justify-between">
                <span className="text-gray-600">UTC:</span>
                <code className="bg-white px-2 py-1 rounded text-sm">{result.utc}</code>
              </div>
            )}
            {result.relative && (
              <div className="flex justify-between">
                <span className="text-gray-600">Relative:</span>
                <code className="bg-white px-2 py-1 rounded">{result.relative}</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}