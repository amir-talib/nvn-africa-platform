import MobilizerHeader from '@/components/layout/MobilizerHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Construction
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobilizerMessages = () => {
  const navigate = useNavigate();

  return (
    <>
      <MobilizerHeader title="Messages" subtitle="Team communication" />

      <div className="flex-1 overflow-hidden p-6">
        <Card className="h-full">
          <CardContent className="h-full flex items-center justify-center p-12">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-mobilizer/10 flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-mobilizer" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Messaging Coming Soon
              </h2>
              <p className="text-muted-foreground mb-6">
                The team messaging feature is currently under development.
                For now, you can contact volunteers via their email or phone
                from the volunteer details page.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                <Construction className="w-4 h-4" />
                <span>Feature in development</span>
              </div>
              <Button
                className="bg-mobilizer hover:bg-mobilizer-secondary text-mobilizer-foreground"
                onClick={() => navigate('/mobilizer/volunteers')}
              >
                View Volunteers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MobilizerMessages;

