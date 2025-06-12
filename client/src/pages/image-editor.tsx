import { useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useImageEditor } from '@/hooks/use-image-editor';
import { Header } from '@/components/header';
import { AnnouncementBanner } from '@/components/announcement-banner';
import { LeftSidebar } from '@/components/left-sidebar';
import { MainEditor } from '@/components/main-editor';
import { RightSidebar } from '@/components/right-sidebar';
import { Footer } from '@/components/footer';
import type { ToolType, TransformOperation } from '@/types/image-editor';

export default function ImageEditor() {
  useEffect(() => {
    document.title = 'Image Editor - Edit Photos Online Free | ImageCraft Lite';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional online image editor with advanced tools. Edit photos, apply filters, adjust brightness, contrast, saturation. Resize, crop, rotate images. Export in multiple formats.');
    }
  }, []);
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    state,
    initializeCanvas,
    loadImage,
    updateFilter,
    applyResize,
    applyTransform,
    updateResizeSettings,
    applySocialMediaPreset,
    updateExportSettings,
    applyExportSettings,
    downloadImage,
    undo,
    redo,
    resetFilters,
    deleteImage,
    selectTool,
    canUndo,
    canRedo,
    socialMediaPresets
  } = useImageEditor();

  // Initialize canvas when component mounts
  useEffect(() => {
    console.log('useEffect running, canvasRef.current:', canvasRef.current);
    if (canvasRef.current) {
      initializeCanvas(canvasRef.current);
    }
  }, [initializeCanvas]);

  // Additional effect to ensure canvas is initialized when ref changes
  useEffect(() => {
    if (canvasRef.current && !state.canvas) {
      console.log('Canvas ref available but not initialized, initializing now');
      initializeCanvas(canvasRef.current);
    }
  }, [canvasRef.current, state.canvas, initializeCanvas]);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      await loadImage(file);
      toast({
        title: "Image loaded successfully",
        description: `Loaded ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`
      });
    } catch (error) {
      toast({
        title: "Failed to load image",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  }, [loadImage, toast]);

  const handleFilterChange = useCallback((tool: ToolType, value: number) => {
    updateFilter(tool, value);
  }, [updateFilter]);

  const handleTransform = useCallback((operationType: string) => {
    const operation: TransformOperation = { type: operationType as TransformOperation['type'] };
    applyTransform(operation);
    toast({
      title: "Transform applied",
      description: `Applied ${operationType} transformation`
    });
  }, [applyTransform, toast]);

  const handleApplyResize = useCallback(() => {
    applyResize();
    toast({
      title: "Resize applied",
      description: `Resized to ${state.resizeSettings.width}×${state.resizeSettings.height}px`
    });
  }, [applyResize, state.resizeSettings, toast]);

  const handleSocialPresetSelect = useCallback((presetName: string) => {
    applySocialMediaPreset(presetName);
    toast({
      title: "Preset applied",
      description: `Applied ${presetName} dimensions`
    });
  }, [applySocialMediaPreset, toast]);

  const handleApplyExportSettings = useCallback(() => {
    applyExportSettings();
    
    let description = `Format: ${state.exportSettings.format}`;
    if (state.exportSettings.format === 'jpeg') {
      description += `, Quality: ${state.exportSettings.quality}%`;
    }
    if (state.exportSettings.targetFileSize) {
      description += `, Target size: ${state.exportSettings.targetFileSize}${state.exportSettings.fileSizeUnit}`;
    }
    
    toast({
      title: "Export settings applied",
      description
    });
  }, [applyExportSettings, state.exportSettings, toast]);

  const handleDownload = useCallback(() => {
    try {
      downloadImage();
      toast({
        title: "Download started",
        description: "Your edited image is being downloaded"
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the image",
        variant: "destructive"
      });
    }
  }, [downloadImage, toast]);

  const handleUndo = useCallback(() => {
    undo();
    toast({
      title: "Undone",
      description: "Reverted to previous state"
    });
  }, [undo, toast]);

  const handleRedo = useCallback(() => {
    redo();
    toast({
      title: "Redone",
      description: "Applied next state"
    });
  }, [redo, toast]);

  const handleReset = useCallback(() => {
    resetFilters();
    toast({
      title: "Reset applied",
      description: "All filters have been reset to default"
    });
  }, [resetFilters, toast]);

  const handleDelete = useCallback(() => {
    deleteImage();
    toast({
      title: "Image deleted",
      description: "Image has been removed from the editor"
    });
  }, [deleteImage, toast]);

  const hasImage = !!state.originalImage;
  const currentFilterValue = state.selectedTool ? state.filters[state.selectedTool] : 50;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <AnnouncementBanner />
      
      <div className="flex flex-1 flex-col xl:flex-row">
        {/* Desktop Left Sidebar */}
        <div className="hidden xl:block">
          <LeftSidebar
            onTransform={handleTransform}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            dimensions={state.dimensions}
          />
        </div>
        
        {/* Main Editor - Full width on mobile */}
        <div className="flex-1">
          <MainEditor
            onImageUpload={handleImageUpload}
            onFilterChange={handleFilterChange}
            onDownload={handleDownload}
            onReset={handleReset}
            onDelete={handleDelete}
            onToolSelect={selectTool}
            hasImage={hasImage}
            selectedTool={state.selectedTool}
            filterValue={currentFilterValue}
            isProcessing={state.isProcessing}
            canvasRef={canvasRef}
          />
        </div>
        
        {/* Desktop Right Sidebar */}
        <div className="hidden xl:block">
          <RightSidebar
            resizeSettings={state.resizeSettings}
            exportSettings={state.exportSettings}
            onResizeSettingsChange={updateResizeSettings}
            onExportSettingsChange={updateExportSettings}
            onApplyResize={handleApplyResize}
            onApplyExportSettings={handleApplyExportSettings}
            onSocialPresetSelect={handleSocialPresetSelect}
            socialPresets={socialMediaPresets}
          />
        </div>
      </div>
      
      {/* Mobile Bottom Controls Panel */}
      <div className="xl:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Transform Controls */}
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-gray-700 dark:text-gray-300">Transform</h4>
              <div className="flex flex-wrap gap-1">
                <button 
                  onClick={() => handleTransform('rotate-left')}
                  disabled={!hasImage}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50 touch-manipulation min-h-[32px]"
                >
                  ↺
                </button>
                <button 
                  onClick={() => handleTransform('rotate-right')}
                  disabled={!hasImage}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50 touch-manipulation min-h-[32px]"
                >
                  ↻
                </button>
                <button 
                  onClick={() => handleTransform('flip-horizontal')}
                  disabled={!hasImage}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50 touch-manipulation min-h-[32px]"
                >
                  ⇄
                </button>
              </div>
            </div>

            {/* Undo/Redo */}
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-gray-700 dark:text-gray-300">History</h4>
              <div className="flex flex-wrap gap-1">
                <button 
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50 touch-manipulation min-h-[32px]"
                >
                  ↶
                </button>
                <button 
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50 touch-manipulation min-h-[32px]"
                >
                  ↷
                </button>
              </div>
            </div>

            {/* Quick Resize */}
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-gray-700 dark:text-gray-300">Size</h4>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {state.dimensions.width}×{state.dimensions.height}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-gray-700 dark:text-gray-300">Actions</h4>
              <button 
                onClick={handleReset}
                disabled={!hasImage}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50 touch-manipulation min-h-[32px] w-full"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden canvas for image processing - always present */}
      <canvas
        ref={canvasRef}
        className="hidden"
        style={{ display: 'none' }}
      />
      
      <Footer />
      

    </div>
  );
}
