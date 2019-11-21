from mesa import Agent, Model
from mesa.space import ContinuousSpace
from mesa.time import RandomActivation
from mesa.visualization.ModularVisualization import VisualizationElement, ModularServer
import random
import numpy as np


class Patient(Agent):
    def __init__(self, unique_id, model, pos):
        super().__init__(unique_id=unique_id,
                         model=model)
        self.pos = pos

    # TODO add step()


class HospitalModel(Model):
    description = "This hospital model emulates the flow of patients into the A&E room"

    def __init__(self, n_patients=10, height=500, width=500):
        self.n_patients = n_patients
        self.space = ContinuousSpace(x_max=width, y_max=height, torus=True)
        self.schedule = RandomActivation(self)
        self.add_patient()
        self.running = True

    def add_patient(self):
        for i in range(self.n_patients):
            x = random.randrange(1, self.space.x_max - 1)
            y = random.randrange(1, self.space.y_max - 1)
            pos = np.array((x, y))
            patient = Patient(unique_id=i, model=self, pos=pos)
            self.space.place_agent(agent=patient, pos=pos)
            self.schedule.add(agent=patient)                                # Adding patient to the schedule.agents


class Canvas(VisualizationElement):
    local_includes = ["canvas.js"]

    def __init__(self, drawing_method, canvas_height, canvas_width):
        self.drawing_method = drawing_method
        self.canvas_height = canvas_height
        self.canvas_width = canvas_width
        new_element = ("new Simple_Continuous_Module({}, {})"
                       .format(self.canvas_width, self.canvas_height))
        self.js_code = "elements.push(" + new_element + ");"

    def render(self, model):
        space = list()
        for agent in model.schedule.agents:
            draw_obj = self.drawing_method(agent)
            x, y = agent.pos
            print(agent.unique_id, x, y)
            x = ((x - model.space.x_min) /
                 (model.space.x_max - model.space.x_min))
            y = ((y - model.space.y_min) /
                 (model.space.y_max - model.space.y_min))
            draw_obj['x'], draw_obj['y'] = x, y
            space.append(draw_obj)
        return space


def agent_draw(agent):
    """
    Defines how the agents (the patients & the obstructions/borders) are drawn in
    the model visualization.
    """
    portrayal = None

    # If drawing a patient
    if isinstance(agent, Patient):
        portrayal = {
            "shape": "patient",
            "filled": True,
            "color": "blue",
            "radius": 5,

            "id": agent.unique_id
        }

    return portrayal


if __name__ == "__main__":
    model_params = {
        "height": 500,
        "width": 700,
        "n_patients": 10
    }
    hospital_canvas = Canvas(drawing_method=agent_draw,
                             canvas_height=model_params.get("height"),
                             canvas_width=model_params.get("width"))

    server = ModularServer(model_cls=HospitalModel,
                           visualization_elements=[hospital_canvas],
                           name="MedQueue - Hospital Queue Modelling",
                           model_params=model_params)
    server.launch()
