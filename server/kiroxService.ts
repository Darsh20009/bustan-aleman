const KIROX_API_KEY = process.env.KIROX_API_KEY || 'qmeet_a25ff524dee9a63a850b4d687e571155f60e22ec';
const KIROX_BASE_URL = process.env.KIROX_BASE_URL || 'https://qiroxstudio.online';

interface KiroxMeeting {
  roomName: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  joinUrl?: string;
  status?: string;
}

interface CreateMeetingParams {
  title: string;
  scheduledAt: string;
  durationMinutes: number;
}

async function kiroxRequest(method: string, path: string, body?: any): Promise<any> {
  const url = `${KIROX_BASE_URL}${path}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-qmeet-api-key': KIROX_API_KEY,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kirox API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export const kiroxService = {
  async createMeeting(params: CreateMeetingParams): Promise<KiroxMeeting> {
    try {
      const result = await kiroxRequest('POST', '/api/qmeet/v1/meetings', {
        title: params.title,
        scheduledAt: params.scheduledAt,
        durationMinutes: params.durationMinutes,
      });

      console.log('✅ Kirox meeting created:', result.roomName || result.data?.roomName);
      return result.data || result;
    } catch (error: any) {
      console.error('❌ Kirox create meeting error:', error.message);
      throw error;
    }
  },

  async listMeetings(): Promise<KiroxMeeting[]> {
    try {
      const result = await kiroxRequest('GET', '/api/qmeet/v1/meetings');
      return result.data || result || [];
    } catch (error: any) {
      console.error('❌ Kirox list meetings error:', error.message);
      return [];
    }
  },

  async getMeeting(roomName: string): Promise<KiroxMeeting | null> {
    try {
      const result = await kiroxRequest('GET', `/api/qmeet/v1/meetings/${roomName}`);
      return result.data || result;
    } catch (error: any) {
      console.error('❌ Kirox get meeting error:', error.message);
      return null;
    }
  },

  async deleteMeeting(roomName: string): Promise<boolean> {
    try {
      await kiroxRequest('DELETE', `/api/qmeet/v1/meetings/${roomName}`);
      console.log('✅ Kirox meeting deleted:', roomName);
      return true;
    } catch (error: any) {
      console.error('❌ Kirox delete meeting error:', error.message);
      return false;
    }
  },

  getJoinUrl(roomName: string): string {
    return `${KIROX_BASE_URL}/room/${roomName}`;
  },

  isConfigured(): boolean {
    return !!KIROX_API_KEY;
  },
};
