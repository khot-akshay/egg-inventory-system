import React, { useState, useEffect, useRef } from 'react';
import Icon from 'src/@core/components/icon';

// Component to fetch and display icons from Iconify
const IconPicker = ({ onSelectIcon = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [icons, setIcons] = useState([]);
  const [filteredIcons, setFilteredIcons] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const modalRef = useRef(null);
  const iconsPerPage = 100; // Number of icons to display per page

  // Handle clicks outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch collections on initial load
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.iconify.design/collections');
        const data = await response.json();
        
        // Format collections data
        const collectionsArray = Object.keys(data).map(key => ({
          id: key,
          name: data[key].name || key,
          total: data[key].total || 0,
          prefix: `${key}:`
        }));
        
        // Sort by popularity (total icons)
        collectionsArray.sort((a, b) => b.total - a.total);
        
        setCollections(collectionsArray);
        
        // Set default collection to the one with most icons
        if (collectionsArray.length > 0) {
          setSelectedCollection(collectionsArray[0].id);
        }
      } catch (error) {
        } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Fetch icons when collection changes
  useEffect(() => {
    const fetchIcons = async () => {
      if (!selectedCollection) return;
      
      try {
        setLoading(true);
        setPage(1); // Reset to page 1 when changing collections
        setIcons([]); // Clear previous icons
        
        const response = await fetch(`https://api.iconify.design/${selectedCollection}.json?icons=${searchQuery}`);
        const data = await response.json();
        
        if (data && data.icons) {
          const iconNames = Object.keys(data.icons);
          setIcons(iconNames);
          setFilteredIcons(iconNames.slice(0, iconsPerPage));
          setHasMore(iconNames.length > iconsPerPage);
        }
      } catch (error) {
        } finally {
        setLoading(false);
      }
    };

    if (selectedCollection) {
      fetchIcons();
    }
  }, [selectedCollection]);

  // Filter icons based on search query
  useEffect(() => {
    if (!icons.length) return;
    
    const filtered = icons.filter(icon => 
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredIcons(filtered.slice(0, page * iconsPerPage));
    setHasMore(filtered.length > page * iconsPerPage);
  }, [searchQuery, icons, page]);

  // Handle loading more icons when scrolling
  const loadMoreIcons = () => {
    if (!hasMore || loading) return;
    
    const newPage = page + 1;
    setPage(newPage);
    
    const filtered = icons.filter(icon => 
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredIcons(filtered.slice(0, newPage * iconsPerPage));
    setHasMore(filtered.length > newPage * iconsPerPage);
  };

  // Handle scroll event for infinite loading
  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMoreIcons();
    }
  };

  // Get the current collection's prefix
  const getCurrentPrefix = () => {
    const collection = collections.find(c => c.id === selectedCollection);
    return collection ? collection.prefix : '';
  };

  // Handle icon selection
  const handleSelectIcon = (icon) => {
    const prefix = getCurrentPrefix();
    const fullIconName = `${prefix}${icon}`;
    setSelectedIcon(fullIconName);
    onSelectIcon(fullIconName);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Icon Picker Trigger Button */}
      <button 
        className="flex items-center justify-center p-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedIcon ? (
          <div className="flex items-center">
            <div className="mr-2">
              {/* This would use an actual Iconify component in a real implementation */}
              <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center text-xs">
                {selectedIcon.split(':')[1].substring(0, 2)}
              </div>
            </div>
            <span className="text-sm text-gray-700">{selectedIcon}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Select an icon</span>
        )}
      </button>

      {/* Icon Picker Modal */}
      {isOpen && (
        <div 
          ref={modalRef}
          className="absolute z-10 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200"
        >
          {/* Header with Close Button */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium">Iconify Icon Picker</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <Icon icon={'material-symbols:close'}/>
            </button>
          </div>

          {/* Collection Selector */}
          <div className="p-3 border-b border-gray-200">
            <label htmlFor="collection" className="block text-xs font-medium text-gray-700 mb-1">
              Collection
            </label>
            <select
              id="collection"
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
              disabled={loading || collections.length === 0}
            >
              {collections.length === 0 ? (
                <option>Loading collections...</option>
              ) : (
                collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name} ({collection.total})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon icon={'material-symbols:search'}/>
              </div>
              <input
                type="text"
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md"
                disabled={loading}
              />
            </div>
          </div>

          {/* Icons Grid */}
          <div 
            className="p-3 max-h-60 overflow-y-auto"
            onScroll={handleScroll}
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                loading
              </div>
            ) : filteredIcons.length > 0 ? (
              <div className="grid grid-cols-5 gap-2">
                {filteredIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => handleSelectIcon(icon)}
                    className="h-10 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    title={`${getCurrentPrefix()}${icon}`}
                  >
                    {/* In a real implementation, display actual icon here */}
                    <div className="text-xs overflow-hidden text-ellipsis max-w-full px-1">
                      {icon.length > 8 ? `${icon.substring(0, 8)}...` : icon}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                No icons found
              </div>
            )}
            
            {!loading && hasMore && (
              <div className="text-center mt-2 text-xs text-gray-500">
                Scroll for more icons
              </div>
            )}
          </div>
          
          {/* Footer with counts */}
          <div className="p-2 border-t border-gray-200 text-xs text-gray-500 text-center">
            {selectedCollection && (
              <>Showing {filteredIcons.length} of {icons.length} icons</>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPicker;