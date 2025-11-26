import { useState } from "react";
import { Heart, User, FileText, Calendar, Phone, Mail, CheckCircle, XCircle, Clock, Video, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const mockApplications = [
  {
    id: "APP001",
    animalName: "Luna",
    applicantName: "Priya Sharma",
    applicantEmail: "priya.sharma@email.com",
    applicantPhone: "+91 98765 43210",
    applicationDate: "2024-01-15",
    status: "pending",
    experience: "First-time owner",
    homeType: "Apartment with balcony",
    familySize: 3,
    otherPets: false,
    score: 85
  },
  {
    id: "APP002",
    animalName: "Max",
    applicantName: "Raj Kumar",
    applicantEmail: "raj.kumar@email.com", 
    applicantPhone: "+91 87654 32109",
    applicationDate: "2024-01-14",
    status: "approved",
    experience: "Experienced with dogs",
    homeType: "House with large garden",
    familySize: 4,
    otherPets: true,
    score: 92
  },
  {
    id: "APP003",
    animalName: "Whiskers",
    applicantName: "Sneha Reddy",
    applicantEmail: "sneha.reddy@email.com",
    applicantPhone: "+91 76543 21098",
    applicationDate: "2024-01-13",
    status: "rejected",
    experience: "Some experience",
    homeType: "Small apartment",
    familySize: 2,
    otherPets: false,
    score: 65
  }
];

const mockInterviews = [
  {
    id: "INT001",
    applicantName: "Priya Sharma",
    animalName: "Luna",
    scheduledDate: "2024-01-20",
    scheduledTime: "14:00",
    type: "video",
    status: "scheduled"
  },
  {
    id: "INT002",
    applicantName: "Amit Patel",
    animalName: "Buddy",
    scheduledDate: "2024-01-21",
    scheduledTime: "10:30",
    type: "in-person",
    status: "completed"
  }
];

const mockFollowups = [
  {
    id: "FU001",
    adopterName: "Raj Kumar",
    animalName: "Max",
    adoptionDate: "2024-01-10",
    nextFollowup: "2024-02-10",
    status: "healthy",
    notes: "Settling in well, very happy"
  },
  {
    id: "FU002",
    adopterName: "Sarah Johnson",
    animalName: "Mittens",
    adoptionDate: "2023-12-15",
    nextFollowup: "2024-01-18",
    status: "needs_attention",
    notes: "Minor adjustment issues"
  }
];

const AdoptionSection = () => {
  const [activeTab, setActiveTab] = useState("applications");
  const [statusFilter, setStatusFilter] = useState("all");
  const [applications, setApplications] = useState(mockApplications);
  const [interviews, setInterviews] = useState(mockInterviews);
  const [followups, setFollowups] = useState(mockFollowups);
  
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ date: "", time: "", type: "video" });
  const [followupDialog, setFollowupDialog] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'status-available';
      case 'pending': return 'status-pending';
      case 'rejected': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const filteredApplications = statusFilter === "all" 
    ? applications 
    : applications.filter(app => app.status === statusFilter);

  const handleReview = (application: any) => {
    setSelectedApp(application);
    setReviewDialog(true);
  };

  const handleApprove = (appId: string) => {
    setApplications(prev => prev.map(app => 
      app.id === appId ? { ...app, status: 'approved' } : app
    ));
    toast.success("Application approved successfully!");
    setReviewDialog(false);
  };

  const handleReject = (appId: string) => {
    setApplications(prev => prev.map(app => 
      app.id === appId ? { ...app, status: 'rejected' } : app
    ));
    toast.error("Application rejected");
    setReviewDialog(false);
  };

  const handleScheduleInterview = () => {
    if (!scheduleForm.date || !scheduleForm.time) {
      toast.error("Please fill in all fields");
      return;
    }
    const newInterview = {
      id: `INT${Date.now()}`,
      applicantName: selectedApp?.applicantName || "Applicant",
      animalName: selectedApp?.animalName || "Animal",
      scheduledDate: scheduleForm.date,
      scheduledTime: scheduleForm.time,
      type: scheduleForm.type,
      status: "scheduled"
    };
    setInterviews(prev => [...prev, newInterview]);
    toast.success("Interview scheduled successfully!");
    setScheduleDialog(false);
    setScheduleForm({ date: "", time: "", type: "video" });
  };

  const handleAddFollowup = () => {
    toast.success("Follow-up note added successfully!");
    setFollowupDialog(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-2">
              <Input placeholder="Search applications..." className="w-64" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const StatusIcon = getStatusIcon(application.status);
              return (
                <Card key={application.id} className="card-warm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">Application #{application.id}</CardTitle>
                          <Badge className={getStatusColor(application.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {application.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            Score: {application.score}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {application.animalName}
                          </span>
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {application.applicantName}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {application.applicationDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleReview(application)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        {application.status === 'pending' && (
                          <>
                            <Button size="sm" className="btn-hope" onClick={() => handleApprove(application.id)}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(application.id)}>Reject</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-medium">Applicant Details</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                            {application.applicantEmail}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                            {application.applicantPhone}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Experience:</span> {application.experience}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Family Size:</span> {application.familySize} members
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Home Environment</h4>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-muted-foreground">Home Type:</span> {application.homeType}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Other Pets:</span> {application.otherPets ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Interview Schedule</h3>
            <Button className="btn-hope" onClick={() => {
              setSelectedApp(applications[0]);
              setScheduleDialog(true);
            }}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </div>

          <div className="space-y-4">
            {interviews.map((interview) => (
              <Card key={interview.id} className="card-warm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{interview.applicantName}</h4>
                        <Badge>{interview.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-2" />
                          Animal: {interview.animalName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {interview.scheduledDate} at {interview.scheduledTime}
                        </div>
                        <div className="flex items-center">
                          <Video className="h-4 w-4 mr-2" />
                          Type: {interview.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Reschedule</Button>
                      <Button size="sm" className="btn-trust">Join</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="followups" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Post-Adoption Follow-ups</h3>
            <Button className="btn-trust" onClick={() => {
              setSelectedFollowup(followups[0]);
              setFollowupDialog(true);
            }}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Add Follow-up
            </Button>
          </div>

          <div className="space-y-4">
            {followups.map((followup) => (
              <Card key={followup.id} className="card-warm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{followup.adopterName}</h4>
                        <Badge className={followup.status === 'healthy' ? 'status-available' : 'status-urgent'}>
                          {followup.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-2" />
                          Animal: {followup.animalName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Adopted: {followup.adoptionDate}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Next Follow-up: {followup.nextFollowup}
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">Notes:</span> {followup.notes}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Call</Button>
                      <Button size="sm" className="btn-hope" onClick={() => {
                        setSelectedFollowup(followup);
                        setFollowupDialog(true);
                      }}>Update</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Application - {selectedApp?.id}</DialogTitle>
            <DialogDescription>Full details of the adoption application</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Applicant Name</Label>
                  <p className="text-sm">{selectedApp.applicantName}</p>
                </div>
                <div>
                  <Label>Animal</Label>
                  <p className="text-sm">{selectedApp.animalName}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{selectedApp.applicantEmail}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm">{selectedApp.applicantPhone}</p>
                </div>
                <div>
                  <Label>Experience</Label>
                  <p className="text-sm">{selectedApp.experience}</p>
                </div>
                <div>
                  <Label>Home Type</Label>
                  <p className="text-sm">{selectedApp.homeType}</p>
                </div>
                <div>
                  <Label>Score</Label>
                  <Badge>{selectedApp.score}%</Badge>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setReviewDialog(false)}>Close</Button>
                {selectedApp.status === 'pending' && (
                  <>
                    <Button className="btn-hope" onClick={() => handleApprove(selectedApp.id)}>Approve</Button>
                    <Button variant="destructive" onClick={() => handleReject(selectedApp.id)}>Reject</Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={scheduleDialog} onOpenChange={setScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>Set up an interview with the applicant</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})} />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={scheduleForm.time} onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={scheduleForm.type} onValueChange={(value) => setScheduleForm({...scheduleForm, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setScheduleDialog(false)}>Cancel</Button>
              <Button className="btn-trust" onClick={handleScheduleInterview}>Schedule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Follow-up Dialog */}
      <Dialog open={followupDialog} onOpenChange={setFollowupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Follow-up</DialogTitle>
            <DialogDescription>Add notes about the follow-up visit</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select defaultValue="healthy">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="needs_attention">Needs Attention</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Add follow-up notes..." rows={4} />
            </div>
            <div>
              <Label>Next Follow-up Date</Label>
              <Input type="date" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFollowupDialog(false)}>Cancel</Button>
              <Button className="btn-hope" onClick={handleAddFollowup}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdoptionSection;