function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Your custom logo */}
      <img 
        src="/simplify-slovakia.svg" 
        alt="Simplify Slovakia Logo" 
        className="h-12 w-12 flex-shrink-0"
      />
      
      <div className="flex flex-col">
        <span className="text-xl font-bold text-indigo-900 leading-tight">
          Simplify Slovakia
        </span>
        <span className="text-xs text-gray-600 leading-tight">
          Immigration Made Clear
        </span>
      </div>
    </div>
  )
}

export default Logo
