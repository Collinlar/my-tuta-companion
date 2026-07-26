import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Brain, BookOpen, Users, Edit, Trash2, Clock, Save, Share2, Eye, X } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: Date;
}

interface FlashcardSet {
  id: string;
  title: string;
  subject: string;
  description?: string;
  cards: Flashcard[];
  status: 'draft' | 'published';
  studentsAssigned: number;
  createdAt: Date;
  updatedAt: Date;
}

export function CreateFlashcards() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [isEditingSet, setIsEditingSet] = useState(false);
  const [newSetData, setNewSetData] = useState({
    title: '',
    subject: '',
    description: ''
  });
  const [newCard, setNewCard] = useState({
    front: '',
    back: ''
  });
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Load flashcard sets from localStorage
  useEffect(() => {
    const savedSets = localStorage.getItem('teacherFlashcardSets');
    if (savedSets) {
      const parsed = JSON.parse(savedSets).map((set: any) => ({
        ...set,
        createdAt: new Date(set.createdAt),
        updatedAt: new Date(set.updatedAt),
        cards: set.cards.map((card: any) => ({
          ...card,
          createdAt: new Date(card.createdAt)
        }))
      }));
      setFlashcardSets(parsed);
    } else {
      // Initialize with empty array for new users
      setFlashcardSets([]);
    }
  }, []);

  const saveFlashcardSets = (sets: FlashcardSet[]) => {
    localStorage.setItem('teacherFlashcardSets', JSON.stringify(sets));
  };

  const createNewSet = () => {
    if (!newSetData.title || !newSetData.subject) return;
    
    const newSet: FlashcardSet = {
      id: Date.now().toString(),
      title: newSetData.title,
      subject: newSetData.subject,
      description: newSetData.description,
      cards: [],
      status: 'draft',
      studentsAssigned: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedSets = [...flashcardSets, newSet];
    setFlashcardSets(updatedSets);
    saveFlashcardSets(updatedSets);
    setCurrentSet(newSet);
    setNewSetData({ title: '', subject: '', description: '' });
    setIsCreatingSet(false);
  };

  const addCard = () => {
    if (!newCard.front || !newCard.back || !currentSet) return;
    
    const card: Flashcard = {
      id: Date.now().toString(),
      front: newCard.front,
      back: newCard.back,
      createdAt: new Date()
    };
    
    const updatedSet = {
      ...currentSet,
      cards: [...currentSet.cards, card],
      updatedAt: new Date()
    };
    
    const updatedSets = flashcardSets.map(set => 
      set.id === currentSet.id ? updatedSet : set
    );
    
    setFlashcardSets(updatedSets);
    setCurrentSet(updatedSet);
    saveFlashcardSets(updatedSets);
    setNewCard({ front: '', back: '' });
  };

  const updateCard = () => {
    if (!editingCard || !currentSet) return;
    
    const updatedSet = {
      ...currentSet,
      cards: currentSet.cards.map(card => 
        card.id === editingCard.id ? editingCard : card
      ),
      updatedAt: new Date()
    };
    
    const updatedSets = flashcardSets.map(set => 
      set.id === currentSet.id ? updatedSet : set
    );
    
    setFlashcardSets(updatedSets);
    setCurrentSet(updatedSet);
    saveFlashcardSets(updatedSets);
    setEditingCard(null);
  };

  const deleteCard = (cardId: string) => {
    if (!currentSet) return;
    
    const updatedSet = {
      ...currentSet,
      cards: currentSet.cards.filter(card => card.id !== cardId),
      updatedAt: new Date()
    };
    
    const updatedSets = flashcardSets.map(set => 
      set.id === currentSet.id ? updatedSet : set
    );
    
    setFlashcardSets(updatedSets);
    setCurrentSet(updatedSet);
    saveFlashcardSets(updatedSets);
  };

  const deleteSet = (setId: string) => {
    const updatedSets = flashcardSets.filter(set => set.id !== setId);
    setFlashcardSets(updatedSets);
    saveFlashcardSets(updatedSets);
    if (currentSet?.id === setId) {
      setCurrentSet(null);
    }
  };

  const publishSet = (setId: string) => {
    const updatedSets = flashcardSets.map(set => 
      set.id === setId ? { ...set, status: 'published' as const, updatedAt: new Date() } : set
    );
    setFlashcardSets(updatedSets);
    saveFlashcardSets(updatedSets);
  };

  const shareSet = (set: FlashcardSet) => {
    const shareLink = `https://tutaai.com/flashcards/${set.id}`;
    navigator.clipboard.writeText(shareLink);
    // You could add a toast notification here
    alert('Share link copied to clipboard!');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assess
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Flashcards</h1>
            <p className="text-slate-600">Design interactive flashcard sets for your students</p>
          </div>
        </div>
        <Dialog open={isCreatingSet} onOpenChange={setIsCreatingSet}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              New Flashcard Set
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Flashcard Set</DialogTitle>
              <DialogDescription>
                Create a new flashcard set for your students
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Title</label>
                <Input
                  value={newSetData.title}
                  onChange={(e) => setNewSetData({ ...newSetData, title: e.target.value })}
                  placeholder="Enter flashcard set title"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Subject</label>
                <Select value={newSetData.subject} onValueChange={(value) => setNewSetData({ ...newSetData, subject: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description (Optional)</label>
                <Textarea
                  value={newSetData.description}
                  onChange={(e) => setNewSetData({ ...newSetData, description: e.target.value })}
                  placeholder="Enter a description for this flashcard set"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreatingSet(false)}>
                  Cancel
                </Button>
                <Button onClick={createNewSet} className="bg-green-600 hover:bg-green-700">
                  Create Set
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Creation Options */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card 
              className="border-2 border-dashed border-slate-200 hover:border-green-300 transition-colors cursor-pointer"
              onClick={() => setIsCreatingSet(true)}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Quick Create</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Start with a blank flashcard set
                </p>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Create Set
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="border-2 border-dashed border-slate-200 hover:border-green-300 transition-colors cursor-pointer"
              onClick={() => setShowTemplates(true)}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">From Template</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Use pre-made templates
                </p>
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Browse Templates
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Flashcard Sets List */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Your Flashcard Sets</h2>
            <div className="space-y-4">
              {flashcardSets.map((set) => (
                <Card key={set.id} className="border border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{set.title}</h3>
                          <Badge 
                            className={
                              set.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }
                          >
                            {set.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{set.subject}</p>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                          <span>{set.cards.length} cards</span>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {set.studentsAssigned} students
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Modified {formatDate(set.updatedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => setCurrentSet(set)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => deleteSet(set.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {set.status === 'draft' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => publishSet(set.id)}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                        )}
                        {set.status === 'published' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => shareSet(set)}
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => setCurrentSet(set)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {currentSet ? (
            <>
              {/* Current Set Info */}
              <Card className="border border-slate-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900">{currentSet.title}</CardTitle>
                      <CardDescription className="text-slate-600">{currentSet.subject}</CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentSet(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                    <span>{currentSet.cards.length} cards</span>
                    <Badge 
                      className={
                        currentSet.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {currentSet.status}
                    </Badge>
                  </div>
                  {currentSet.description && (
                    <p className="text-sm text-slate-600 mb-4">{currentSet.description}</p>
                  )}
                </CardContent>
              </Card>

              {/* Flashcard Builder */}
              <Card className="border border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900">Add New Card</CardTitle>
                  <CardDescription className="text-slate-600">Create individual flashcards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Front (Question)</label>
                    <Textarea
                      value={newCard.front}
                      onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                      placeholder="Enter the question or term..."
                      className="min-h-20 border-slate-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Back (Answer)</label>
                    <Textarea
                      value={newCard.back}
                      onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                      placeholder="Enter the answer or definition..."
                      className="min-h-20 border-slate-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <Button 
                    onClick={addCard}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={!newCard.front || !newCard.back}
                  >
                    Add Card
                  </Button>
                </CardContent>
              </Card>

              {/* Current Cards */}
              <Card className="border border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900">Current Cards</CardTitle>
                  <CardDescription className="text-slate-600">{currentSet.cards.length} cards in this set</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {currentSet.cards.map((card) => (
                      <div key={card.id} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900 mb-1">{card.front}</div>
                            <div className="text-sm text-slate-600">{card.back}</div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => setEditingCard(card)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              onClick={() => deleteCard(card.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {currentSet.cards.length === 0 && (
                      <div className="text-center text-slate-500 py-8">
                        No cards yet. Add your first card above!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Flashcard Builder */}
              <Card className="border border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900">Flashcard Builder</CardTitle>
                  <CardDescription className="text-slate-600">Select a set to start adding cards</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Choose a flashcard set from the list to start building</p>
                </CardContent>
              </Card>

              {/* Study Statistics */}
              <Card className="border border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900">Study Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Sets Created</span>
                      <span className="font-semibold text-slate-900">{flashcardSets.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Cards</span>
                      <span className="font-semibold text-slate-900">
                        {flashcardSets.reduce((total, set) => total + set.cards.length, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Students Using</span>
                      <span className="font-semibold text-slate-900">
                        {flashcardSets.reduce((total, set) => total + set.studentsAssigned, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Published Sets</span>
                      <span className="font-semibold text-slate-900">
                        {flashcardSets.filter(set => set.status === 'published').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Card Editing Dialog */}
      <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update the flashcard content
            </DialogDescription>
          </DialogHeader>
          {editingCard && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Front (Question)</label>
                <Textarea
                  value={editingCard.front}
                  onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })}
                  placeholder="Enter the question or term..."
                  className="min-h-20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Back (Answer)</label>
                <Textarea
                  value={editingCard.back}
                  onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })}
                  placeholder="Enter the answer or definition..."
                  className="min-h-20"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingCard(null)}>
                  Cancel
                </Button>
                <Button onClick={updateCard} className="bg-green-600 hover:bg-green-700">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Flashcard Templates</DialogTitle>
            <DialogDescription>
              Choose from pre-made flashcard templates to get started quickly
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                // Create a new set from template
                const templateSet: FlashcardSet = {
                  id: Date.now().toString(),
                  title: "Basic Vocabulary",
                  subject: "English",
                  description: "Basic English vocabulary template",
                  cards: [
                    { id: '1', front: 'Hello', back: 'A greeting', createdAt: new Date() },
                    { id: '2', front: 'Goodbye', back: 'A farewell', createdAt: new Date() },
                    { id: '3', front: 'Thank you', back: 'An expression of gratitude', createdAt: new Date() }
                  ],
                  status: 'draft',
                  studentsAssigned: 0,
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                const updatedSets = [...flashcardSets, templateSet];
                setFlashcardSets(updatedSets);
                saveFlashcardSets(updatedSets);
                setCurrentSet(templateSet);
                setShowTemplates(false);
              }}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Basic Vocabulary</h3>
                <p className="text-sm text-slate-600 mb-3">English vocabulary with definitions</p>
                <div className="text-xs text-slate-500">3 sample cards included</div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                const templateSet: FlashcardSet = {
                  id: Date.now().toString(),
                  title: "Math Formulas",
                  subject: "Mathematics",
                  description: "Common mathematical formulas",
                  cards: [
                    { id: '1', front: 'Area of circle', back: 'A = πr²', createdAt: new Date() },
                    { id: '2', front: 'Pythagorean theorem', back: 'a² + b² = c²', createdAt: new Date() },
                    { id: '3', front: 'Quadratic formula', back: 'x = (-b ± √(b²-4ac)) / 2a', createdAt: new Date() }
                  ],
                  status: 'draft',
                  studentsAssigned: 0,
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                const updatedSets = [...flashcardSets, templateSet];
                setFlashcardSets(updatedSets);
                saveFlashcardSets(updatedSets);
                setCurrentSet(templateSet);
                setShowTemplates(false);
              }}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Math Formulas</h3>
                <p className="text-sm text-slate-600 mb-3">Common mathematical formulas and equations</p>
                <div className="text-xs text-slate-500">3 sample cards included</div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                const templateSet: FlashcardSet = {
                  id: Date.now().toString(),
                  title: "Science Terms",
                  subject: "Science",
                  description: "Basic science terminology",
                  cards: [
                    { id: '1', front: 'Photosynthesis', back: 'Process by which plants make food', createdAt: new Date() },
                    { id: '2', front: 'Gravity', back: 'Force that pulls objects toward Earth', createdAt: new Date() },
                    { id: '3', front: 'Atom', back: 'Smallest unit of matter', createdAt: new Date() }
                  ],
                  status: 'draft',
                  studentsAssigned: 0,
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                const updatedSets = [...flashcardSets, templateSet];
                setFlashcardSets(updatedSets);
                saveFlashcardSets(updatedSets);
                setCurrentSet(templateSet);
                setShowTemplates(false);
              }}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Science Terms</h3>
                <p className="text-sm text-slate-600 mb-3">Basic science terminology and definitions</p>
                <div className="text-xs text-slate-500">3 sample cards included</div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                const templateSet: FlashcardSet = {
                  id: Date.now().toString(),
                  title: "History Dates",
                  subject: "History",
                  description: "Important historical events and dates",
                  cards: [
                    { id: '1', front: 'World War II', back: '1939-1945', createdAt: new Date() },
                    { id: '2', front: 'American Revolution', back: '1775-1783', createdAt: new Date() },
                    { id: '3', front: 'Fall of Berlin Wall', back: '1989', createdAt: new Date() }
                  ],
                  status: 'draft',
                  studentsAssigned: 0,
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                const updatedSets = [...flashcardSets, templateSet];
                setFlashcardSets(updatedSets);
                saveFlashcardSets(updatedSets);
                setCurrentSet(templateSet);
                setShowTemplates(false);
              }}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">History Dates</h3>
                <p className="text-sm text-slate-600 mb-3">Important historical events and their dates</p>
                <div className="text-xs text-slate-500">3 sample cards included</div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}