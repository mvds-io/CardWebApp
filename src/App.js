import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Edit2, Check } from 'lucide-react';

const DraggableCard = ({ heading, content, onDragStart, onDelete, onEdit, isEditable }) => {
  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedHeading, setEditedHeading] = useState(heading);
  const [editedContent, setEditedContent] = useState(content);

  const handleEditHeadingClick = () => setIsEditingHeading(true);
  const handleEditContentClick = () => setIsEditingContent(true);

  const handleSaveHeadingClick = () => {
    onEdit('heading', editedHeading);
    setIsEditingHeading(false);
  };

  const handleSaveContentClick = () => {
    onEdit('content', editedContent);
    setIsEditingContent(false);
  };

  return (
    <Card
      draggable={!isEditingHeading && !isEditingContent}
      onDragStart={onDragStart}
      className="m-1 w-60 inline-flex flex-col justify-between cursor-move bg-white shadow-md rounded-lg transition-shadow hover:shadow-lg overflow-hidden"
    >
      <div className="bg-blue-100 p-2">
        {isEditingHeading ? (
          <Input
            value={editedHeading}
            onChange={(e) => setEditedHeading(e.target.value)}
            className="text-sm font-bold mb-1"
          />
        ) : (
          <h3 className="text-sm font-bold truncate">{heading}</h3>
        )}
        {isEditable && (
          <Button variant="ghost" size="icon" onClick={isEditingHeading ? handleSaveHeadingClick : handleEditHeadingClick}>
            {isEditingHeading ? <Check className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <div className="p-2">
        {isEditingContent ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="text-sm w-full h-20 p-1 border rounded"
          />
        ) : (
          <p className="text-sm overflow-hidden h-20">{content}</p>
        )}
        {isEditable && (
          <Button variant="ghost" size="icon" onClick={isEditingContent ? handleSaveContentClick : handleEditContentClick}>
            {isEditingContent ? <Check className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          </Button>
        )}
      </div>
      {isEditable && (
        <div className="flex justify-end p-2">
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  );
};

const AreaContainer = ({ title, cards, onDragOver, onDrop, onDragStart, onDelete, onEdit }) => (
  <div
    className="w-full bg-white rounded-lg shadow-md min-h-[300px] mb-6 overflow-hidden"
    onDragOver={onDragOver}
    onDrop={onDrop}
  >
    <h2 className="text-lg font-bold mb-4 p-4 bg-green-100">{title}</h2>
    <div className="flex flex-wrap p-4">
      {cards.map((card, index) => (
        <DraggableCard
          key={index}
          heading={card.heading}
          content={card.content}
          onDragStart={(e) => onDragStart(e, index, title)}
          onDelete={() => onDelete(index)}
          onEdit={(field, newValue) => onEdit(index, field, newValue)}
          isEditable={title === 'Unassigned'}
        />
      ))}
    </div>
  </div>
);

const App = () => {
  const [inputHeading, setInputHeading] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const [areas, setAreas] = useState({
    'Unassigned': []
  });

  const handleInputHeadingChange = (e) => setInputHeading(e.target.value);
  const handleInputContentChange = (e) => setInputContent(e.target.value);
  const handleNewAreaNameChange = (e) => setNewAreaName(e.target.value);

  const handleAddResource = () => {
    if (inputHeading.trim() !== '') {
      setAreas(prevAreas => ({
        ...prevAreas,
        'Unassigned': [...prevAreas['Unassigned'], { heading: inputHeading, content: inputContent }]
      }));
      setInputHeading('');
      setInputContent('');
    }
  };

  const handleAddNewArea = () => {
    if (newAreaName.trim() !== '' && !areas.hasOwnProperty(newAreaName)) {
      setAreas(prevAreas => ({
        ...prevAreas,
        [newAreaName]: []
      }));
      setNewAreaName('');
    }
  };

  const handleDeleteCard = (areaName, index) => {
    if (areaName === 'Unassigned') {
      setAreas(prevAreas => ({
        ...prevAreas,
        [areaName]: prevAreas[areaName].filter((_, i) => i !== index)
      }));
    }
  };

  const handleEditCard = (areaName, index, field, newValue) => {
    if (areaName === 'Unassigned') {
      setAreas(prevAreas => ({
        ...prevAreas,
        [areaName]: prevAreas[areaName].map((card, i) => 
          i === index ? { ...card, [field]: newValue } : card
        )
      }));
    }
  };

  const handleDragStart = (e, index, source) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, source }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { index, source } = data;

    if (source !== target) {
      setAreas(prevAreas => {
        const newAreas = { ...prevAreas };
        const [movedCard] = newAreas[source].splice(index, 1);
        newAreas[target] = [...newAreas[target], movedCard];
        return newAreas;
      });
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex flex-wrap items-end">
        <div className="w-full md:w-1/4 mb-2 md:mb-0 md:mr-2">
          <Input
            type="text"
            value={newAreaName}
            onChange={handleNewAreaNameChange}
            placeholder="Enter new area name"
            className="w-full"
          />
        </div>
        <div className="w-full md:w-1/4 mb-2 md:mb-0 md:mr-2">
          <Input
            type="text"
            value={inputHeading}
            onChange={handleInputHeadingChange}
            placeholder="Enter resource heading"
            className="w-full"
          />
        </div>
        <div className="w-full md:w-1/4 mb-2 md:mb-0 md:mr-2">
          <Input
            type="text"
            value={inputContent}
            onChange={handleInputContentChange}
            placeholder="Enter resource content"
            className="w-full"
          />
        </div>
        <div className="w-full md:w-auto">
          <Button onClick={handleAddNewArea} className="mr-2 mb-2 md:mb-0">Add New Area</Button>
          <Button onClick={handleAddResource}>Add Resource</Button>
        </div>
      </div>
      <div className="flex flex-wrap -mx-3">
        {Object.entries(areas).map(([areaName, cards]) => (
          <div key={areaName} className="w-full px-3 mb-6">
            <AreaContainer
              title={areaName}
              cards={cards}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, areaName)}
              onDragStart={(e, index) => handleDragStart(e, index, areaName)}
              onDelete={(index) => handleDeleteCard(areaName, index)}
              onEdit={(index, field, newValue) => handleEditCard(areaName, index, field, newValue)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;