import { getMyProfile } from './actions';
import { Card, CardContent } from '@/components/ui/card';
import { ProfileForm } from './profile-form';
import { SignOutButton } from './sign-out-button';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const profile = await getMyProfile();

  if (!profile) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-foreground/50 font-body">Unable to load profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-label text-foreground/40 mb-1">Account</p>
        <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>
      </div>

      {/* Avatar + role */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest to-pine flex items-center justify-center">
              <span className="text-2xl font-bold text-white font-display">
                {(profile.name || profile.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                {profile.name || 'Traveler'}
              </h2>
              <p className="text-sm text-foreground/40 font-body">{profile.email}</p>
              <p className="text-xs text-emerald font-body mt-1 capitalize">
                {profile.role === 'operator_rep' ? 'Operator Rep' : profile.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <p className="font-label text-foreground/40 mb-4">Edit Details</p>
          <ProfileForm
            name={profile.name || ''}
            phone={profile.phone || ''}
            email={profile.email}
          />
        </CardContent>
      </Card>

      {/* Account info */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <p className="font-label text-foreground/40 mb-3">Account Info</p>
          <div className="space-y-2 text-sm font-body">
            <div className="flex justify-between">
              <span className="text-foreground/50">Member since</span>
              <span className="text-foreground">
                {new Date(profile.created_at).toLocaleDateString('en-NG', {
                  month: 'long', year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">User ID</span>
              <span className="font-mono text-xs text-foreground/40">{profile.id.slice(0, 8)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <SignOutButton />
    </div>
  );
}
