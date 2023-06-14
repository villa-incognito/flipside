import type { searchDashboard } from "@fscrypto/domain";
import type { ActorRefFrom } from "xstate";
import { createMachine } from "xstate";

interface CreateMachineProps {
  dashboard: searchDashboard.SearchDashboard;
}

export const createDashboardCardMachine = ({ dashboard }: CreateMachineProps) => {
  /** @xstate-layout N4IgpgJg5mDOIC5QGMCGAnCBZVyAWAlgHZgB0eA9gG5jqkCecAxFgPICqAygKID6AMtwCCANW4BtAAwBdRKAAOFWAQAuBCkTkgAHogCMANkmk9AJgDMAdgCcAFgAclp4YOmANCHqJrxywFY-G3tTa3MjSVtbAF8ojzRMHHxiMkoaOiIKFg4eXm4AOQAVbgAlKVkkEEVlNQ0tXQQ9P3tScz1ze1CO2wsrAw8vBts9UlNbP3breyG7H3sYuIxsXEISUgAbAgBrSAZmdjz+AEkAaQkZLSrVdU0K+uD+xDDh2yfrPXsDSMsDO3mQeKWSVWG22EF2sFI8jARAgxCg-C2cKYEA0ZGIVAo23WWzAABFULA8AAjCiLMoXJRXWq3fR6UIjH5+Uz2PySczmSSWewPBBNSykAwGcy2SSSAyOPRDPx-AGJFZkEE7DJMI6nckVS41G6geqWNqkWw+VqmNmiwV+Hms8ykD62QWRQ1C+x6GWLOXJbGg0gZSHQ2FEKDsIggpEo1bozFkACuwZx+MJJLJ5w1lK1dUQtksplIkiZuc+fje-kslv8JiFIrFEqG5ldCWWHsVYJ9xFUTHVClT13TCD1thaekHfhFdlz1msPIMhYNTXZjUMVnGMViIAyEDgWllDZIFOq3ZpCAAtKYDC1ItYmi5LJmhTzD1MRo0mcE-Izgi6V1ugSlqLRd1TtR0RBTGGKdWSGex2VMJkrB5a1TEsSRJUlE1gnMSZrAMOtAXlchfzoRh4BTPdqR1R5zGzdoQk5JxIgMJwLU8bxrBaKx0PFKZx3eOZPzdbcfzSb0KH-NMDx+AUAgid4oJgksmIQTCbTYzD7E4t4WWw91gRxCARP3MiEBPHkEOtC9cwQyZEOHaVePrb9PR2Qi9NIoCEBfUhhxCVpx2HKZuXkoZ+TpNonBNHxJAsTT+IcsFCN9GE4QRTY4WcwC7ksa1PNCOkLwcBxLSFctzXnIwMssKL7KbcFSFbFRUp7DCc2+GxxVMEIQMtCIBScMdMNCmyFjs3CqoyeqD2vHk7Wtd5JEsp0pzMWtbJwxsdKE+L-UDWNkoDMaDLMdx5MkgVBQWvxDE5KwKuGtaWyIVQ9tcws-AkiwIrZDkuT6eShWzBbEMMPtJWXKIgA */
  return createMachine({
    id: "cardMachine",
    type: "parallel",
    tsTypes: {} as import("./dashboard-card.typegen").Typegen0,
    schema: {
      context: {} as CardMachineContext,
      events: {} as DashboardTreeEvent,
    },
    context: {
      dashboard: dashboard,
    },
    states: {
      hover: {
        initial: "no",
        states: {
          yes: {
            on: {
              MOUSE_LEAVE: "no",
            },
          },
          no: {
            on: {
              MOUSE_ENTER: "yes",
            },
          },
        },
      },
    },
  });
};

export type DashboardCardActorRef = ActorRefFrom<ReturnType<typeof createDashboardCardMachine>>;

interface CardMachineContext {
  dashboard: searchDashboard.SearchDashboard;
}

export type LikeInfo = {
  resourceId: string;
  resourceType: string;
};

type DashboardTreeEvent =
  | {
      type: "SORT_BY.TRENDING";
    }
  | {
      type: "MOUSE_ENTER";
    }
  | {
      type: "MOUSE_LEAVE";
    };
