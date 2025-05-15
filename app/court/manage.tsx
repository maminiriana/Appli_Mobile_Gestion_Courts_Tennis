import React, { useEffect, useState } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet, Button, TextInput } from 'react-native';
import axios from 'axios';

export default function CourtManagementDashboard() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [maintenanceStart, setMaintenanceStart] = useState('');
  const [maintenanceEnd, setMaintenanceEnd] = useState('');
  const [maintenanceComment, setMaintenanceComment] = useState('');
  const [comments, setComments] = useState<{ [key: number]: any[] }>({});
  const [newComment, setNewComment] = useState('');
  const [usageStats, setUsageStats] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      const response = await axios.get('/api/courts');
      setCourts(response.data);
      setLoading(false);
      // Fetch usage stats and comments for each court
      response.data.forEach((court: any) => {
        fetchUsageStats(court.id);
        fetchComments(court.id);
      });
    } catch (error) {
      console.error('Error fetching courts:', error);
      setLoading(false);
    }
  };

  const fetchUsageStats = async (courtId: number) => {
    try {
      const response = await axios.get(`/api/courts/${courtId}/statistics`);
      setUsageStats(prev => ({ ...prev, [courtId]: response.data.reservation_count }));
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  const fetchComments = async (courtId: number) => {
    try {
      const response = await axios.get(`/api/courts/${courtId}/comments`);
      setComments(prev => ({ ...prev, [courtId]: response.data }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const toggleActivation = async (courtId: number, currentStatus: boolean) => {
    try {
      await axios.post(`/api/courts/${courtId}/activation`, { active: !currentStatus });
      fetchCourts();
    } catch (error) {
      console.error('Error toggling activation:', error);
    }
  };

  const scheduleMaintenance = async () => {
    if (!selectedCourt || !maintenanceStart || !maintenanceEnd) {
      alert('Please select a court and enter maintenance start and end dates.');
      return;
    }
    try {
      await axios.post(`/api/courts/${selectedCourt}/maintenance`, {
        start_date: maintenanceStart,
        end_date: maintenanceEnd,
        comment: maintenanceComment,
      });
      alert('Maintenance scheduled successfully');
      setMaintenanceStart('');
      setMaintenanceEnd('');
      setMaintenanceComment('');
      setSelectedCourt(null);
      fetchCourts();
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
    }
  };

  const addComment = async (courtId: number) => {
    if (!newComment) {
      alert('Please enter a comment.');
      return;
    }
    try {
      await axios.post(`/api/courts/${courtId}/comments`, {
        comment: newComment,
        admin_user: 'admin', // Replace with actual admin user info
      });
      setNewComment('');
      fetchComments(courtId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return <Text>Loading courts...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Court Management Dashboard</Text>
      {courts.map((court: any) => (
        <View key={court.id} style={styles.courtItem}>
          <Text style={styles.courtName}>{court.name}</Text>
          <View style={styles.activationRow}>
            <Text>Status: {court.active ? 'Active' : 'Deactivated'}</Text>
            <Switch
              value={court.active}
              onValueChange={() => toggleActivation(court.id, court.active)}
            />
          </View>
          <Text>Usage Statistics: {usageStats[court.id] || 0} reservations</Text>
          <Text>Maintenance Periods:</Text>
          {court.maintenancePeriods && court.maintenancePeriods.length > 0 ? (
            court.maintenancePeriods.map((m: any, index: number) => (
              <Text key={index}>
                {m.start_date} to {m.end_date} - {m.comment || 'No comment'}
              </Text>
            ))
          ) : (
            <Text>No maintenance scheduled</Text>
          )}
          <Text>Admin Comments:</Text>
          {comments[court.id] && comments[court.id].length > 0 ? (
            comments[court.id].map((comment: any, index: number) => (
              <Text key={index}>
                [{comment.created_at}] {comment.admin_user}: {comment.comment}
              </Text>
            ))
          ) : (
            <Text>No comments</Text>
          )}
          <TextInput
            style={styles.input}
            placeholder="Add a comment"
            value={newComment}
            onChangeText={setNewComment}
          />
          <Button title="Add Comment" onPress={() => addComment(court.id)} />
          <Button title="Select for Maintenance" onPress={() => setSelectedCourt(court.id)} />
        </View>
      ))}

      {selectedCourt && (
        <View style={styles.maintenanceForm}>
          <Text style={styles.formTitle}>Schedule Maintenance for Court ID: {selectedCourt}</Text>
          <TextInput
            style={styles.input}
            placeholder="Start Date (YYYY-MM-DD)"
            value={maintenanceStart}
            onChangeText={setMaintenanceStart}
          />
          <TextInput
            style={styles.input}
            placeholder="End Date (YYYY-MM-DD)"
            value={maintenanceEnd}
            onChangeText={setMaintenanceEnd}
          />
          <TextInput
            style={styles.input}
            placeholder="Comment"
            value={maintenanceComment}
            onChangeText={setMaintenanceComment}
          />
          <Button title="Schedule Maintenance" onPress={scheduleMaintenance} />
          <Button title="Cancel" onPress={() => setSelectedCourt(null)} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  courtItem: {
    marginBottom: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  courtName: {
    fontSize: 18,
    fontWeight: '600',
  },
  activationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  maintenanceForm: {
    marginTop: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
});
