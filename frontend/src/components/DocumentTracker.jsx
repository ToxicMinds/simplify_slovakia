function DocumentTracker({ documents, onToggle }) {
  const commonDocuments = [
    'Passport / National ID',
    'Employment Contract',
    'Proof of Address',
    'Bank Statements',
    'Travel Insurance',
    'Passport Photos',
    'Birth Certificate',
    'Marriage Certificate (if applicable)',
    'Educational Certificates',
    'Police Clearance Certificate',
  ]

  const collectedCount = Object.values(documents).filter(Boolean).length

  return (
    <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:border">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Document Checklist</h3>
      <p className="text-sm text-gray-600 mb-4">
        Track which documents you've collected: {collectedCount} of {commonDocuments.length}
      </p>
      
      <div className="grid md:grid-cols-2 gap-2">
        {commonDocuments.map((doc) => (
          <label
            key={doc}
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer print:hover:bg-white"
          >
            <input
              type="checkbox"
              checked={documents[doc] || false}
              onChange={() => onToggle(doc)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 print:hidden"
            />
            {/* Print checkbox */}
            <div className={`hidden print:block w-4 h-4 border-2 rounded ${documents[doc] ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
              {documents[doc] && (
                <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`text-sm ${documents[doc] ? 'line-through text-gray-500' : 'text-gray-700'}`}>
              {doc}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default DocumentTracker
