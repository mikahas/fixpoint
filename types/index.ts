export interface Zone {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Component {
  id: string;
  name: string;
  zoneId: string;
  decayRate: number;
  lastCondition: number;
  lastServicedAt: Date;
  createdAt: Date;
}

export interface MaintenanceAction {
  id: string;
  name: string;
  componentId: string;
  conditionEffect: number;
}

export interface LogEntry {
  id: string;
  componentId: string;
  actionId: string;
  note: string | null;
  resultingCondition: number;
  performedAt: Date;
  action?: MaintenanceAction;
}

export interface ComponentWithCondition extends Component {
  currentCondition: number;
}

export interface ZoneWithStatus extends Zone {
  components: ComponentWithCondition[];
  worstCondition: number;
}
